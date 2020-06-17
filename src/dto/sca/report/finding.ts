import { Severity } from './severity';

export class Finding {
    private _id: string = '';
    private _cveName: string = '';
    private _score: number = 0.0;
    private _severity: Severity | any;
    private _publishDate: string = '';
    private _references: string[] = [];
    private _description: string = '';
    private _recommendations: string = '';
    private _packageId: string = '';
    private _similarityId: string = '';
    private _fixResolutionText: string = '';
    private _isIgnored: boolean = false;

    public get id(): string {
        return this._id;
    }

    public set id(value: string) {
        this._id = value;
    }

    public get cveName(): string {
        return this._cveName;
    }

    public set cveName(value: string) {
        this._cveName = value;
    }

    public get score(): number {
        return this._score;
    }

    public set score(value: number) {
        this._score = value;
    }

    public get severity(): Severity {
        return this._severity;
    }

    public set severity(value: Severity) {
        this._severity = value;
    }

    public get publishDate(): string {
        return this._publishDate;
    }

    public set publishDate(value: string) {
        this._publishDate = value;
    }

    public get references(): string[] {
        return this._references;
    }

    public set references(value: string[]) {
        this._references = value;
    }

    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this._description = value;
    }

    public get recommendations(): string {
        return this._recommendations;
    }

    public set recommendations(value: string) {
        this._recommendations = value;
    }

    public get packageId(): string {
        return this._packageId;
    }

    public set packageId(value: string) {
        this._packageId = value;
    }

    public get similarityId(): string {
        return this._similarityId;
    }

    public set similarityId(value: string) {
        this._similarityId = value;
    }

    public get fixResolutionText(): string {
        return this._fixResolutionText;
    }

    public set fixResolutionText(value: string) {
        this._fixResolutionText = value;
    }

    public get isIgnored(): boolean {
        return this._isIgnored;
    }

    public set isIgnored(value: boolean) {
        this._isIgnored = value;
    }
}