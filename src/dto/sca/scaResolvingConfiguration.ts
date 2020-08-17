export class ScaResolvingConfiguration {
    private _manifests: string[] = [];
    private _fingerprints: string[] = [];

    constructor(manifests: string[], fingerprints: string[]) {
        this._manifests = manifests;
        this._fingerprints = fingerprints;
    }

    public getManifestsIncludePattern(): string {
        return this._manifests.join(',').toLowerCase();
    }

    public getFingerprintsIncludePattern(): string {
        return this._fingerprints.join(',').toLowerCase();
    }
}