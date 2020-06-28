import { Finding } from './finding';

export class CveReportTableRow {
    private _name: string = '';
    private _severity: string = '';
    private _publishDate: string = '';
    private _libraryName: string = '';
    private _state: string = '';

    constructor(finding: Finding) {
        this._state = finding.isIgnored ? "NOT_EXPLOITABLE" : "EXPLOITABLE";
        this._name = finding.id;
        const dateFormat = require('dateformat');
        this._publishDate = dateFormat(finding.publishDate, "shortDate");
        this._libraryName = finding.packageId;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get severity(): string {
        return this._severity;
    }

    public set severity(value: string) {
        this._severity = value;
    }

    public get publishDate(): string {
        return this._publishDate;
    }

    public set publishDate(value: string) {
        this._publishDate = value;
    }

    public get libraryName(): string {
        return this._libraryName;
    }

    public set libraryName(value: string) {
        this._libraryName = value;
    }

    public get state(): string {
        return this._state;
    }

    public set state(value: string) {
        this._state = value;
    }
}