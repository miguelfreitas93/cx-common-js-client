
export class ScaLoginSettings{
    private _accessControlBaseUrl:string = '';
    private _username:string = '';
    private _password:string ='';
    private _tenant:string ='';
    private _refreshToken:string='';


    get accessControlBaseUrl(): string {
        return this._accessControlBaseUrl;
    }

    set accessControlBaseUrl(value: string) {
        this._accessControlBaseUrl = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get tenant(): string {
        return this._tenant;
    }

    set tenant(value: string) {
        this._tenant = value;
    }

    get refreshToken(): string {
        return this._refreshToken;
    }

    set refreshToken(value: string) {
        this._refreshToken = value;
    }
}