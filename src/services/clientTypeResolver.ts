import { ClientType } from "../dto/sca/clientType";
import * as request from 'superagent';

export class ClientTypeResolver {
    private static WELL_KNOWN_CONFIG_PATH: string = "identity/.well-known/openid-configuration";
    private static scopesForCloudAuth: string[] = ['sca_api', 'offline_access'];
    private static scopesForOnPremAuth: string[] = ['sast_rest_api', 'cxarm_api'];


    public static async determineClientType(accessControlServerBaseUrl: string): Promise<ClientType> {
        const fullUrl = ClientTypeResolver.getFullUrl(accessControlServerBaseUrl);

        const supportedScopes = await ClientTypeResolver.getScopes(fullUrl) as string[];


        let scopesToUse: string[] = [];
        let scopeForPrem: boolean = false;
        if (supportedScopes.indexOf('sca_api') > -1 && supportedScopes.indexOf('offline_access') > -1) {
            scopesToUse = ClientTypeResolver.scopesForCloudAuth;
        }

        else if (supportedScopes.indexOf('sast_rest_api') > -1 && supportedScopes.indexOf('cxarm_api') > -1) {
            scopesToUse = ClientTypeResolver.scopesForOnPremAuth;
            scopeForPrem = true;
        }

        let clientSecret = scopeForPrem ? ClientType.RESOURCE_OWNER.clientSecret : "";

        const scopesForRequest: string = scopesToUse.join(" ");
        return new ClientType(ClientType.RESOURCE_OWNER.clientId, scopesForRequest, clientSecret);
    }

    private static getScopes(fullUrl:string) : Promise<any>{
        return request['get'](fullUrl)
            .accept('json')
            .then(
                (response: request.Response) => response.body.scopes_supported,
                async (err: any) =>
                {
                    return [];
                 }
            );
    }
   


    private static getFullUrl(baseUrl: string): string {
        baseUrl = (baseUrl.slice(baseUrl.length - 1) == '/') ? baseUrl : baseUrl + '/';
        return baseUrl + ClientTypeResolver.WELL_KNOWN_CONFIG_PATH;

    }

}

export default ClientTypeResolver;