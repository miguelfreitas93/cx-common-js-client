export class ScanInfoResponse {
    private _id: string = '';
    private _status: string = '';

    public get id(): string {
        return this._id;
    }

    public set id(value: string) {
        this._id = value;
    }

    public get status(): string {
        return this._status;
    }

    public set status(value: string) {
        this._status = value;
    }
}