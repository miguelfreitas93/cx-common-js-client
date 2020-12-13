export class ClientType {
    public static readonly RESOURCE_OWNER = new ClientType('resource_owner_client', 'sast_rest_api', '014DF517-39D1-4453-B7B3-9930C563627C');
    public static readonly SCA = new ClientType('sca_resource_owner', 'sca_api offline_access', '');

    public constructor(public readonly clientId: string, public readonly scopes: string, public readonly clientSecret: string) {
    }
}