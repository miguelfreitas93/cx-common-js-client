import {ScaSummaryResults} from "./scaSummaryResults";

export class SCAResults {
    private _scanId:string ='';
    private _summary:ScaSummaryResults = new ScaSummaryResults();
    private _webReportLink:string='';


    get scanId(): string {
        return this._scanId;
    }

    set scanId(value: string) {
        this._scanId = value;
    }

    get summary(): ScaSummaryResults {
        return this._summary;
    }

    set summary(value: ScaSummaryResults) {
        this._summary = value;
    }

    get webReportLink(): string {
        return this._webReportLink;
    }

    set webReportLink(value: string) {
        this._webReportLink = value;
    }
}