export class ScaSummaryResults {
    private _riskReportId:string='';
    private _highVulnerabilityCount:number=0;
    private _mediumVulnerabilityCount:number=0;
    private _lowVulnerabilityCount:number=0;
    private _totalPackages:number=0;
    private _directPackages:number=0;
    private _createdOn:string='';
    private _riskScore:number=0.0;
    private _totalOutdatedPackages:number=0;


    get riskReportId(): string {
        return this._riskReportId;
    }

    set riskReportId(value: string) {
        this._riskReportId = value;
    }

    get highVulnerabilityCount(): number {
        return this._highVulnerabilityCount;
    }

    set highVulnerabilityCount(value: number) {
        this._highVulnerabilityCount = value;
    }

    get mediumVulnerabilityCount(): number {
        return this._mediumVulnerabilityCount;
    }

    set mediumVulnerabilityCount(value: number) {
        this._mediumVulnerabilityCount = value;
    }

    get lowVulnerabilityCount(): number {
        return this._lowVulnerabilityCount;
    }

    set lowVulnerabilityCount(value: number) {
        this._lowVulnerabilityCount = value;
    }

    get totalPackages(): number {
        return this._totalPackages;
    }

    set totalPackages(value: number) {
        this._totalPackages = value;
    }

    get directPackages(): number {
        return this._directPackages;
    }

    set directPackages(value: number) {
        this._directPackages = value;
    }

    get createdOn(): string {
        return this._createdOn;
    }

    set createdOn(value: string) {
        this._createdOn = value;
    }

    get riskScore(): number {
        return this._riskScore;
    }

    set riskScore(value: number) {
        this._riskScore = value;
    }

    get totalOutdatedPackages(): number {
        return this._totalOutdatedPackages;
    }

    set totalOutdatedPackages(value: number) {
        this._totalOutdatedPackages = value;
    }

}