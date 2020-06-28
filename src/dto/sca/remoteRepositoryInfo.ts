/**
 * Instructs SCA which repository should be scanned.
 * In the future this class may be expanded to include repo credentials and commit/branch/tag reference.
 */
export class RemoteRepositoryInfo {
    // A URL for which 'git clone' is possible
    private _url: string = '';

    public get url(): string {
        return this._url;
    }

    public set url(value: string) {
        this._url = value;
    }
}