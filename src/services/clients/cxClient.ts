import {ScanConfig} from "../..";
import {HttpClient} from "./httpClient";
import Zipper from "../zipper";
import {TaskSkippedError} from "../..";
import {ScanResults} from "../..";
import {SastClient} from "./sastClient";
import * as url from "url";
import {ArmClient} from "./armClient";
import {UpdateScanSettingsRequest} from "../../dto/api/updateScanSettingsRequest";
import {Logger} from "../logger";
import {ReportingClient} from "./reportingClient";
import {ScanSummaryEvaluator} from "../scanSummaryEvaluator";
import {FilePathFilter} from "../filePathFilter";
import {TeamApiClient} from "./teamApiClient";
import {ScanSummary} from "../../dto/scanSummary";
import {ThresholdError} from "../../dto/thresholdError";
import {tmpNameSync} from "tmp";
import {ScaClient} from "./scaClient";
import {ScaLoginSettings} from "../../dto/scaLoginSettings";
import {SCAResults} from "../../dto/scaResults";

/**
 * High-level CX API client that uses specialized clients internally.
 */
export class CxClient {
    private httpClient: HttpClient | any;
    private sastClient: SastClient | any;
    private armClient: ArmClient | any;
    private scaClient: ScaClient | any;

    private teamId = 0;
    private projectId = 0;
    private presetId = 0;
    private isPolicyEnforcementSupported = false;

    private config: ScanConfig | any;

    constructor(private readonly log: Logger) {
    }

    async scan(config: ScanConfig): Promise<ScanResults> {
        this.config = config;
        let result: ScanResults = new ScanResults(config);
        let scaResult:SCAResults = new SCAResults();
        if(config.enableDependencyScan){
            this.log.info("initializing sca client");
            await this.initScaClient();
            this.log.info("uploading zip file to sca");
            await this.uploadSourceCode("sca");
            scaResult = await this.scaClient.retrieveScanResults();
        }

        if(config.enableSastScan){
            //TODO: Add functionality to test sast and add the sca result to the scan result and figure out the output on the client side
            this.log.info('Initializing Cx client');
            await this.initClients();
            await this.initDynamicFields();
            result = await this.createSASTScan(result);

            if (config.isSyncMode) {
                result = await this.getSASTResults(result);
            } else {
                this.log.info('Running in Asynchronous mode. Not waiting for scan to finish.');
            }
        }
        result.scaResults=scaResult;
        return result;
    }

    private async initClients() {
        const baseUrl = url.resolve(this.config.serverUrl, 'CxRestAPI/');
        this.httpClient = new HttpClient(baseUrl, this.config.cxOrigin, this.log);
        await this.httpClient.login(this.config.username, this.config.password);

        this.sastClient = new SastClient(this.config, this.httpClient, this.log);

        this.armClient = new ArmClient(this.httpClient, this.log);
        if (this.config.enablePolicyViolations) {
            await this.armClient.init();
        }
    }

    private async initScaClient(){
        let setting:ScaLoginSettings = new ScaLoginSettings();
        this.resolveScaLoginSettings(setting);
        let scaHttp:HttpClient = new HttpClient(this.config.scaConfig.apiUrl,this.config.cxOrigin,this.log);
        this.scaClient = new ScaClient(this.config.scaConfig,scaHttp,this.log);
        //await this.scaClient.httpClient.scaLogin(setting);
        await this.scaClient.scaLogin(setting);
        await this.scaClient.resolveProject(this.config.projectName);
    }

    private resolveScaLoginSettings(setting:ScaLoginSettings){
        const baseUrl = url.resolve(this.config.scaConfig.accessControlUrl,'');
        setting.accessControlBaseUrl=baseUrl;
        setting.tenant=this.config.scaConfig.tenant;
        setting.username=this.config.scaConfig.username;
        setting.password=this.config.scaConfig.password;
    }

    private async createSASTScan(scanResult:ScanResults): Promise<ScanResults> {
        this.log.info('-----------------------------------Create CxSAST Scan:-----------------------------------');
        await this.updateScanSettings();
        await this.uploadSourceCode('sast');

        scanResult.scanId = await this.sastClient.createScan(this.projectId);

        const projectStateUrl = url.resolve(this.config.serverUrl, `CxWebClient/portal#/projectState/${this.projectId}/Summary`);
        this.log.info(`SAST scan created successfully. CxLink to project state: ${projectStateUrl}`);

        return scanResult;
    }

    private async getSASTResults(result: ScanResults): Promise<ScanResults> {
        this.log.info('------------------------------------Get CxSAST Results:----------------------------------');
        this.log.info('Retrieving SAST scan results');

        await this.sastClient.waitForScanToFinish();

        await this.addStatisticsToScanResults(result);
        await this.addPolicyViolationsToScanResults(result);

        this.printStatistics(result);

        await this.addDetailedReportToScanResults(result);

        const evaluator = new ScanSummaryEvaluator(this.config, this.log, this.isPolicyEnforcementSupported);
        const summary = evaluator.getScanSummary(result);

        this.logPolicyCheckSummary(summary.policyCheck);

        if (summary.hasErrors()) {
            result.buildFailed = true;
            this.logBuildFailure(summary);
        }

        return result;
    }

    private async getOrCreateProject(): Promise<number> {
        let projectId = await this.getCurrentProjectId();
        if (projectId) {
            this.log.debug(`Resolved project ID: ${projectId}`);
        } else {
            this.log.info('Project not found, creating a new one.');

            if (this.config.denyProject) {
                throw Error(
                    `Creation of the new project [${this.config.projectName}] is not authorized. Please use an existing project.` +
                    " You can enable the creation of new projects by disabling the Deny new Checkmarx projects creation checkbox in the Checkmarx plugin global settings.");
            }

            projectId = await this.createNewProject();
        }

        return projectId;
    }

    private async uploadSourceCode(scanType:string): Promise<void> {
        const tempFilename = tmpNameSync({prefix: 'cxsrc-', postfix: '.zip'});
        this.log.info(`Zipping source code at ${this.config.sourceLocation} into file ${tempFilename}`);
        let filter:FilePathFilter;
        if(scanType == 'sast'){
            filter = new FilePathFilter(this.config.fileExtension, this.config.folderExclusion);
        }else{
            filter = new FilePathFilter(this.config.scaConfig.dependencyFileExtension, this.config.scaConfig.dependencyFolderExclusion);
        }
        const zipper = new Zipper(this.log, filter);
        const zipResult = await zipper.zipDirectory(this.config.sourceLocation, tempFilename);

        if (zipResult.fileCount === 0) {
            throw new TaskSkippedError('Zip file is empty: no source to scan');
        }
        this.log.info(`Uploading the zipped source code.`);
        const urlPath = `projects/${this.projectId}/sourceCode/attachments`;
        if(scanType == 'sast'){
        await this.httpClient.postMultipartRequest(urlPath,
            {id: this.projectId},
            {zippedSource: tempFilename});
        }else if(scanType =='sca'){
            this.log.info("uploading sca project file");
            await this.scaClient.httpClient.postMultipartRequest( this.scaClient.ZIP_UPLOAD,
                {projectId: this.scaClient.projectId},
                {zipFile: tempFilename}).then((result:string)=>{this.log.info(result);
                this.scaClient.scanId=result}).catch((reason: string) => {this.log.info(reason)});
        }
    }

    private async getCurrentProjectId(): Promise<number> {
        this.log.info(`Resolving project: ${this.config.projectName}`);
        let result;
        const encodedName = encodeURIComponent(this.config.projectName);
        const path = `projects?projectname=${encodedName}&teamid=${this.teamId}`;
        try {
            const projects = await this.httpClient.getRequest(path, {suppressWarnings: true});
            if (projects && projects.length) {
                result = projects[0].id;
            }
        } catch (err) {
            const isExpectedError = err.response && err.response.notFound;
            if (!isExpectedError) {
                throw err;
            }
        }
        return result;
    }

    private async createNewProject(): Promise<number> {
        const request = {
            name: this.config.projectName,
            owningTeam: this.teamId,
            isPublic: this.config.isPublic
        };

        const newProject = await this.httpClient.postRequest('projects', request);
        this.log.debug(`Created new project, ID: ${newProject.id}`);

        return newProject.id;
    }

    private async updateScanSettings() {
        const settingsResponse = await this.sastClient.getScanSettings(this.projectId);

        const configurationId = settingsResponse &&
            settingsResponse.engineConfiguration &&
            settingsResponse.engineConfiguration.id;

        const request: UpdateScanSettingsRequest = {
            projectId: this.projectId,
            presetId: this.presetId,
            engineConfigurationId: configurationId || 0
        };

        await this.sastClient.updateScanSettings(request);
    }

    private async addPolicyViolationsToScanResults(result: ScanResults) {
        if (!this.config.enablePolicyViolations) {
            return;
        }

        if (!this.isPolicyEnforcementSupported) {
            this.log.warning('Policy enforcement is not supported by the current Checkmarx server version.');
            return;
        }

        await this.armClient.waitForArmToFinish(this.projectId);

        const projectViolations = await this.armClient.getProjectViolations(this.projectId, 'SAST');
        for (const policy of projectViolations) {
            result.sastPolicies.push(policy.policyName);
            for (const violation of policy.violations) {
                result.sastViolations.push({
                    libraryName: violation.source,
                    policyName: policy.policyName,
                    ruleName: violation.ruleName,
                    detectionDate: (new Date(violation.firstDetectionDateByArm)).toLocaleDateString()
                });
            }
        }
    }

    private async addStatisticsToScanResults(result: ScanResults) {
        const statistics = await this.sastClient.getScanStatistics(result.scanId);
        result.highResults = statistics.highSeverity;
        result.mediumResults = statistics.mediumSeverity;
        result.lowResults = statistics.lowSeverity;
        result.infoResults = statistics.infoSeverity;

        const sastScanPath = `CxWebClient/ViewerMain.aspx?scanId=${result.scanId}&ProjectID=${this.projectId}`;
        result.sastScanResultsLink = url.resolve(this.config.serverUrl, sastScanPath);

        const sastProjectLink = `CxWebClient/portal#/projectState/${this.projectId}/Summary`;
        result.sastSummaryResultsLink = url.resolve(this.config.serverUrl, sastProjectLink);

        result.sastResultsReady = true;
    }

    private async addDetailedReportToScanResults(result: ScanResults) {
        const client = new ReportingClient(this.httpClient, this.log);
        //const reportXml = await client.generateReport(result.scanId);
        let reportXml;

        if(this.config.cxOrigin == 'VSTS'){
            for (let i = 1; i < 25; i++) {
                try {
                    reportXml = await client.generateReport(result.scanId,this.config.cxOrigin);
                    if (typeof reportXml !== 'undefined' && reportXml !== null) {
                        break;
                    }
                    await this.delay(15555);
                } catch (e) {
                    this.log.warning('Failed to generate report on attempt number: ' + i);
                    await this.delay(15555);
                }
            }
        }else{
            reportXml = await client.generateReport(result.scanId,this.config.cxOrigin);
        }


        const doc = reportXml.CxXMLResults;
        result.scanStart = doc.$.ScanStart;
        result.scanTime = doc.$.ScanTime;
        result.locScanned = doc.$.LinesOfCodeScanned;
        result.filesScanned = doc.$.FilesScanned;
        result.queryList = CxClient.toJsonQueries(doc.Query);

        // TODO: PowerShell code also adds properties such as newHighCount, but they are not used in the UI.
    }


    private delay(ms: number) {
        this.log.debug("Activating delay for: " + ms);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private printStatistics(result: ScanResults) {
        this.log.info(`----------------------------Checkmarx Scan Results(CxSAST):-------------------------------
High severity results: ${result.highResults}
Medium severity results: ${result.mediumResults}
Low severity results: ${result.lowResults}
Info severity results: ${result.infoResults}

Scan results location:  ${result.sastScanResultsLink}
------------------------------------------------------------------------------------------
`);
    }

    private static toJsonQueries(queries: any[] | undefined) {
        const SEPARATOR = ';';

        // queries can be undefined if no vulnerabilities were found.
        return (queries || []).map(query =>
            JSON.stringify({
                name: query.$.name,
                severity: query.$.Severity,
                resultLength: query.Result.length
            })
        ).join(SEPARATOR);
    }

    private async getVersionInfo() {
        let versionInfo = null;
        try {
            versionInfo = await this.httpClient.getRequest('system/version', {suppressWarnings: true});
            this.log.info(`Checkmarx server version [${versionInfo.version}]. Hotfix [${versionInfo.hotFix}].`);
        } catch (e) {
            versionInfo = 'under9';
            this.log.info('Checkmarx server version is lower than 9.0.');
        }
        return versionInfo;
    }

    private async initDynamicFields() {
        const versionInfo = await this.getVersionInfo();
        this.isPolicyEnforcementSupported = !!versionInfo;

        if (this.config.presetId) {
            this.presetId = this.config.presetId;
        }
        else {
            this.presetId = await this.sastClient.getPresetIdByName(this.config.presetName);
        }

        if (this.config.teamId) {
            this.teamId = this.config.teamId;
        }
        else {
            const teamApiClient = new TeamApiClient(this.httpClient, this.log);
            this.teamId = await teamApiClient.getTeamIdByName(this.config.teamName);
        }

        if (this.config.projectId) {
            this.projectId = this.config.projectId;
        }
        else {
            this.projectId = await this.getOrCreateProject();
        }
    }

    private logBuildFailure(failure: ScanSummary) {
        this.log.error(
            `********************************************
The Build Failed for the Following Reasons:
********************************************`);
        this.logPolicyCheckError(failure.policyCheck);
        this.logThresholdErrors(failure.thresholdErrors);
    }

    private logPolicyCheckSummary(policyCheck: { wasPerformed: boolean; violatedPolicyNames: string[] }) {
        if (policyCheck.wasPerformed) {
            this.log.info(
                `-----------------------------------------------------------------------------------------
Policy Management:
--------------------`);
            if (policyCheck.violatedPolicyNames.length) {
                this.log.info('Project policy status: violated');

                const names = policyCheck.violatedPolicyNames.join(', ');
                this.log.info(`SAST violated policies names: ${names}`);
            } else {
                this.log.info('Project policy status: compliant');
            }
            this.log.info('-----------------------------------------------------------------------------------------');
        }
    }

    private logThresholdErrors(thresholdErrors: ThresholdError[]) {
        if (thresholdErrors.length) {
            this.log.error('Exceeded CxSAST Vulnerability Threshold.');
            for (const error of thresholdErrors) {
                this.log.error(`SAST ${error.severity} severity results are above threshold. Results: ${error.actualViolationCount}. Threshold: ${error.threshold}`);
            }
        }
    }

    private logPolicyCheckError(policyCheck: { violatedPolicyNames: string[] }) {
        if (policyCheck.violatedPolicyNames.length) {
            this.log.error('Project policy status: violated');
        }
    }
}