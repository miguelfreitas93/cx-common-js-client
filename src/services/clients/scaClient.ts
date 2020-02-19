import {Logger, ScaConfig} from "../..";
import {HttpClient} from "./httpClient";
import {Stopwatch} from "../stopwatch";
import {ScanRequest} from "../../dto/api/scanRequest";
import {settings} from "cluster";
import {ScaLoginSettings} from "../../dto/scaLoginSettings";


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
    scanId:string ='';

    private readonly stopwatch = new Stopwatch();

    constructor(private readonly config: ScaConfig,
                private readonly httpClient: HttpClient,
                private readonly log: Logger) {
    }

    public async scaLogin(setting:ScaLoginSettings){
        await this.httpClient.scaLogin(setting,this.AUTHENTICATION);
    }

    public async resolveProject(confProjectName:string){
        this.log.info("resolving project" + confProjectName);
        if(this.projectId == '' ){
            this.log.info("Project not found, creating a new one.");
            this.projectId =await this.createProject(confProjectName);
        }
        this.log.info("Using project ID: " + this.projectId + confProjectName);
    }

    private async createProject(projectName:string):Promise<any>{
        const request = {
            name: projectName
        };
        const newProject = await this.httpClient.postRequest(this.PROJECTS,request);
        this.log.info(`Created new project, ID: ${newProject.id} ${newProject}`);
        return newProject.id;
    }

}