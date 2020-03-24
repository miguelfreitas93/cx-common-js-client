import {Logger, ScaConfig} from "../..";
import {HttpClient} from "./httpClient";
import {Stopwatch} from "../stopwatch";
import {ScaLoginSettings} from "../../dto/scaLoginSettings";
import {SCAResults} from "../../dto/scaResults";
import {ScaSummaryResults} from "../../dto/scaSummaryResults";
import {Project} from "../../dto/project";
import {PollingSettings} from "../../dto/pollingSettings";
import {Waiter} from "../waiter";
import {ScanStatus} from "../../dto/api/scanStatus";
import {ScanStage} from "../../dto/api/scanStage";
import {ScanStatusResponse} from "../../dto/api/scanStatusResponse";
import {StatusName} from "../../dto/api/statusName";


export class ScaClient {
    readonly RISK_MANAGEMENT_API:string = "/risk-management/";
    readonly PROJECTS = this.RISK_MANAGEMENT_API + "projects";
    readonly SUMMARY_REPORT = this.RISK_MANAGEMENT_API + "riskReports/%s/summary";
    readonly SCAN_STATUS = this.RISK_MANAGEMENT_API + "scans/%s/status";
    readonly REPORT_ID = this.RISK_MANAGEMENT_API + "scans/%s/riskReportId";

    readonly ZIP_UPLOAD:string = "/scan-runner/scans/zip";
    readonly WEB_REPORT:string = "/#/projects/%s/reports/%s";
    readonly AUTHENTICATION:string = "/identity/connect/token";

    private projectId:string ='';
    private scanId:string ='';
    private reportId:string ='';

    private readonly stopwatch = new Stopwatch();


    private static readonly SCA_SCAN_COMPLETED_MESSAGE:string="Done";
    //private baseUrl1 = url.resolve("wow", 'CxRestAPI/');

    constructor(private readonly config: ScaConfig,
                private readonly httpClient: HttpClient,
                private readonly log: Logger) {
    }

    public async scaLogin(setting:ScaLoginSettings){
        await this.httpClient.scaLogin(setting,this.AUTHENTICATION);
    }

    public async resolveProject(confProjectName:string){
        this.log.info("resolving project " + confProjectName);
        this.projectId = await this.getProjectIdByName(confProjectName);
        if(this.projectId == '' ){
            this.log.info("Project not found, creating a new one.");
            this.projectId =await this.createProject(confProjectName);
        }
        this.log.info("Using project ID: " + this.projectId);
    }

    private async getProjectIdByName(name:string):Promise<string>{
        if (name=='' || name == null) {
            throw ("Non-empty project name must be provided.");
        }

        let allProject:Project[] = await this.getAllProjects();
        for(let entry of allProject){
            if(entry.name.match(name)){
                this.projectId = entry.id;
                this.log.info('project ' + name + ' found, resolving project id.');
                return entry.id;
            }
        }
        return '';
    }

    private async getAllProjects():Promise<Project[]>{
        return await this.httpClient.getRequest(this.PROJECTS) as Project[];
    }

    private async createProject(projectName:string):Promise<any>{
        const request = {
            name: projectName
        };
        const newProject = await this.httpClient.postRequest(this.PROJECTS,request);
        this.log.info(`Created new project, ID: ${newProject.id}`);
        return newProject.id;
    }


    public async retrieveScanResults():Promise<SCAResults>{
        const reportId:string = await this.getReportId();
        const result:SCAResults = new SCAResults();
        result.scanId = this.scanId;


/*        let lastStatus;
        const waiter = new Waiter();
        try {
            lastStatus = await waiter.waitForTaskToFinish(
                this.checkIfScanFinished,
                this.logWaitingProgress,
                polling);
        } catch (e) {
            throw Error(`Waiting for CxSAST scan has reached the time limit (${polling.masterTimeoutMinutes} minutes).`);
        }*/

        const scanSummary:ScaSummaryResults = await this.getSummaryReport(reportId);
        result.summary = scanSummary;

        const reportLink = this.getWebReportLink();
        result.webReportLink=reportLink;
        this.log.info("Web report link "+ reportLink );
        return result;
    }

    async waitForScanToFinish() {
        this.log.info('Waiting for CxSCA scan to finish.');

        const polling: PollingSettings = {
            masterTimeoutMinutes: 5,
            intervalSeconds: 5
        };

        let lastStatus;
        const waiter = new Waiter();
        try {
            lastStatus = await waiter.waitForTaskToFinish(
                this.checkIfScanFinished,
                this.logWaitingProgress,
                polling);
        } catch (e) {
            throw Error(`Waiting for CxSCA scan has reached the time limit (${polling.masterTimeoutMinutes} minutes).`);
        }

/*        if (SastClient.isFinishedSuccessfully(lastStatus)) {
            this.log.info('SCA scan successfully finished.');
        } else {
            SastClient.throwScanError(lastStatus);
        }*/
    }


    private checkIfScanFinished = () => {
        return new Promise<ScanStatusResponse>((resolve, reject) => {
            this.httpClient.getRequest(`/risk-management/scans/${this.scanId}/status`)
                .then((scanStatusResponse: ScanStatusResponse) => {
                    this.log.debug("scan status from SCA is " + scanStatusResponse.name);
                    if (ScaClient.isInProgress(scanStatusResponse)) {
                        reject(scanStatusResponse);
                    } else {
                        resolve(scanStatusResponse);
                    }
                });
        });
    };

    private static isInProgress(scanStatusResponse: ScanStatusResponse) {
        let result = false;
        if (scanStatusResponse && scanStatusResponse.name) {
            const stage = scanStatusResponse.name;
            result =
                stage !== StatusName.DONE &&
                stage !== StatusName.FAILED &&
                scanStatusResponse.name !== this.SCA_SCAN_COMPLETED_MESSAGE;
        }
        return result;
    }

    private logWaitingProgress = (scanStatusResponse: ScanStatusResponse) => {
        const elapsed = this.stopwatch.getElapsedString();
        const stage = scanStatusResponse && scanStatusResponse.name ? scanStatusResponse.name : 'n/a';
        this.log.info(`Waiting for SCA scan results. Elapsed time: ${elapsed}. Status: ${stage}.`);
    };

    private getWebReportLink():string{
        const MESSAGE = "Unable to generate web report link. ";
        let result:string ='';
        try{
            let webAppUrl = this.config.webAppUrl;
            if(webAppUrl === '' || webAppUrl == undefined || webAppUrl == null){
                this.log.warning(MESSAGE + "Web app URL is not specified.");
            }else{
                result =`${webAppUrl}/#/projects/${this.projectId}/reports/${this.reportId}`;
            }
        }catch (e) {
            this.log.warning(MESSAGE + e);
        }
        return result;
    }

    private async getSummaryReport(reportId:string):Promise<ScaSummaryResults>{
        this.log.debug("Getting summary report.");
        const result:ScaSummaryResults = await this.httpClient.getRequest(`/risk-management/riskReports/${reportId}/summary`) as ScaSummaryResults;
        this.printSummaryResult(result);
        return result;
    }

    private printSummaryResult(summary:ScaSummaryResults) {
    this.log.info("\n----CxSCA risk report summary----");
    this.log.info("Created on: " + summary.createdOn);
    this.log.info("Direct packages: " + summary.directPackages);
    this.log.info("High vulnerabilities: " + summary.highVulnerabilityCount);
    this.log.info("Medium vulnerabilities: " + summary.mediumVulnerabilityCount);
    this.log.info("Low vulnerabilities: " + summary.lowVulnerabilityCount);
    this.log.info("Risk report ID: " + summary.riskReportId);
    this.log.info("Risk score: " + summary.riskScore);
    this.log.info("Total packages: " + summary.totalPackages);
    this.log.info("Total outdated packages:"+ summary.totalOutdatedPackages + '\n');
}


    private async getReportId():Promise<string>{
        this.log.debug("Getting report ID by scan ID: " + this.scanId);

        this.log.info('------------------------------------Get CxSCA Results:----------------------------------');
        this.log.info('Retrieving SCA scan results');
        this.stopwatch.start();
        await this.waitForScanToFinish();

        await this.httpClient.getRequest(`/risk-management/scans/${this.scanId}/riskReportId`).then((result:string)=>{
            this.reportId=result}).catch((reason: string) => {this.log.info(reason)});
        this.log.debug("Report id is" + this.reportId);
        return this.reportId;
    }

     delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

/*    async waitForScanToFinish() {
        this.log.info('Waiting for CxSAST scan to finish.');

        const polling: PollingSettings = {
            masterTimeoutMinutes: this.config.scanTimeoutInMinutes,
            intervalSeconds: SastClient.POLLING_INTERVAL_IN_SECONDS
        };

        let lastStatus;
        const waiter = new Waiter();
        try {
            lastStatus = await waiter.waitForTaskToFinish(
                this.checkIfScanFinished,
                this.logWaitingProgress,
                polling);
        } catch (e) {
            throw Error(`Waiting for CxSAST scan has reached the time limit (${polling.masterTimeoutMinutes} minutes).`);
        }

        if (SastClient.isFinishedSuccessfully(lastStatus)) {
            this.log.info('SAST scan successfully finished.');
        } else {
            SastClient.throwScanError(lastStatus);
        }
    }*/

}