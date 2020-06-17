import { CveReportTableRow } from './report/cveReportTableRow';
import { Finding } from './report/finding';
import { Severity } from './report/severity';
import { SCAResults } from './scaResults';

export class ScaReportResults {
    private _resultReady: boolean = false;
    private _highVulnerability: number = 0;
    private _mediumVulnerability: number = 0;
    private _lowVulnerability: number = 0;
    private _summaryLink: string = '';
    private _vulnerableAndOutdated: number = 0;
    private _nonVulnerableLibraries: number = 0;
    private _scanStartTime: string = '';
    private _scanEndTime: string = '';
    private _dependencyHighCVEReportTable: CveReportTableRow[] = [];
    private _dependencyMediumCVEReportTable: CveReportTableRow[] = [];
    private _dependencyLowCVEReportTable: CveReportTableRow[] = [];
    private _totalLibraries: number = 0;

    constructor(scaResults: SCAResults) {
        if (scaResults) {
            if (scaResults.summary) {
                this._highVulnerability = scaResults.summary.highVulnerabilityCount;
                this._mediumVulnerability = scaResults.summary.mediumVulnerabilityCount;
                this._lowVulnerability = scaResults.summary.lowVulnerabilityCount;
                this._vulnerableAndOutdated = scaResults.summary.totalOutdatedPackages;
                this._nonVulnerableLibraries = scaResults.summary.totalOkLibraries;
                const dateFormat = require('dateformat');
                this._scanStartTime = dateFormat(scaResults.summary.createdOn, "default");
                this._scanEndTime = "";
                this._totalLibraries = scaResults.summary.totalPackages;
            }
            this._resultReady = scaResults.scaResultReady;
            this._summaryLink = scaResults.webReportLink;
            this.setDependencyCVEReportTable(scaResults.findings);
        }
    }

    private setDependencyCVEReportTable(findings: Finding[]) {
        let row: CveReportTableRow;
        (findings || []).forEach(finding => {
            if (finding) {
                row = new CveReportTableRow(finding);
                if (finding.severity === Severity.LOW) {
                    this._dependencyLowCVEReportTable.push(row);
                }
                else if (finding.severity === Severity.MEDIUM) {
                    this._dependencyMediumCVEReportTable.push(row);
                }
                else if (finding.severity === Severity.HIGH) {
                    this._dependencyHighCVEReportTable.push(row);
                }
            }
        });
    }

    public get resultReady(): boolean {
        return this._resultReady;
    }

    public set resultReady(value: boolean) {
        this._resultReady = value;
    }

    public get highVulnerability(): number {
        return this._highVulnerability;
    }

    public set highVulnerability(value: number) {
        this._highVulnerability = value;
    }

    public get mediumVulnerability(): number {
        return this._mediumVulnerability;
    }

    public set mediumVulnerability(value: number) {
        this._mediumVulnerability = value;
    }

    public get lowVulnerability(): number {
        return this._lowVulnerability;
    }

    public set lowVulnerability(value: number) {
        this._lowVulnerability = value;
    }

    public get summaryLink(): string {
        return this._summaryLink;
    }

    public set summaryLink(value: string) {
        this._summaryLink = value;
    }

    public get vulnerableAndOutdated(): number {
        return this._vulnerableAndOutdated;
    }

    public set vulnerableAndOutdated(value: number) {
        this._vulnerableAndOutdated = value;
    }

    public get nonVulnerableLibraries(): number {
        return this._nonVulnerableLibraries;
    }

    public set nonVulnerableLibraries(value: number) {
        this._nonVulnerableLibraries = value;
    }

    public get scanStartTime(): string {
        return this._scanStartTime;
    }

    public set scanStartTime(value: string) {
        this._scanStartTime = value;
    }

    public get scanEndTime(): string {
        return this._scanEndTime;
    }

    public set scanEndTime(value: string) {
        this._scanEndTime = value;
    }

    public get totalLibraries(): number {
        return this._totalLibraries;
    }

    public set totalLibraries(value: number) {
        this._totalLibraries = value;
    }

    public get dependencyHighCVEReportTable(): CveReportTableRow[] {
        return this._dependencyHighCVEReportTable;
    }

    public set dependencyHighCVEReportTable(value: CveReportTableRow[]) {
        this._dependencyHighCVEReportTable = value;
    }

    public get dependencyMediumCVEReportTable(): CveReportTableRow[] {
        return this._dependencyMediumCVEReportTable;
    }

    public set dependencyMediumCVEReportTable(value: CveReportTableRow[]) {
        this._dependencyMediumCVEReportTable = value;
    }

    public get dependencyLowCVEReportTable(): CveReportTableRow[] {
        return this._dependencyLowCVEReportTable;
    }

    public set dependencyLowCVEReportTable(value: CveReportTableRow[]) {
        this._dependencyLowCVEReportTable = value;
    }
}