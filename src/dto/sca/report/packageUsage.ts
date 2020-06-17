export class PackageUsage {
    private _usageType: string = '';
    private _packageId: string = '';

    public get usageType(): string {
        return this._usageType;
    }

    public set usageType(value: string) {
        this._usageType = value;
    }

    public get packageId(): string {
        return this._packageId;
    }

    public set packageId(value: string) {
        this._packageId = value;
    }
}