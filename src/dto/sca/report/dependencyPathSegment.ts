export class DependencyPathSegment {
    private _id: string = '';
    private _name: string = '';
    private _version: string = '';
    private _isResolved: boolean = false;
    private _isDevelopment: boolean = false;

    public get id(): string {
        return this._id;
    }

    public set id(value: string) {
        this._id = value;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get version(): string {
        return this._version;
    }

    public set version(value: string) {
        this._version = value;
    }

    public get isResolved(): boolean {
        return this._isResolved;
    }

    public set isResolved(value: boolean) {
        this._isResolved = value;
    }

    public get isDevelopment(): boolean {
        return this._isDevelopment;
    }

    public set isDevelopment(value: boolean) {
        this._isDevelopment = value;
    }
}