import { ClientType } from './clientType';

export class ScaLoginSettings {
    private _apiUrl: string = '';
    private _accessControlBaseUrl: string = '';
    private _username: string = '';
    private _password: string = '';
    private _tenant: string = '';
    private _clientTypeForPasswordAuth: ClientType | any;

    public get apiUrl(): string {
        return this._apiUrl;
    }

    public set apiUrl(value: string) {
        this._apiUrl = value;
    }

    public get accessControlBaseUrl(): string {
        return this._accessControlBaseUrl;
    }

    public set accessControlBaseUrl(value: string) {
        this._accessControlBaseUrl = value;
    }

    public get username(): string {
        return this._username;
    }

    public set username(value: string) {
        this._username = value;
    }

    public get password(): string {
        return this._password;
    }

    public set password(value: string) {
        this._password = value;
    }

    public get tenant(): string {
        return this._tenant;
    }

    public set tenant(value: string) {
        this._tenant = value;
    }

    public get clientTypeForPasswordAuth(): ClientType | any {
        return this._clientTypeForPasswordAuth;
    }

    public set clientTypeForPasswordAuth(value: ClientType | any) {
        this._clientTypeForPasswordAuth = value;
    }
}