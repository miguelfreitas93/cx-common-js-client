import { SourceLocationType } from './sourceLocationType';
import { RemoteRepositoryInfo } from './remoteRepositoryInfo';

export interface ScaConfig {
    apiUrl: string;
    accessControlUrl: string;
    username: string;
    password: string;
    tenant: string;
    webAppUrl: string;
    sourceLocationType: SourceLocationType;
    remoteRepositoryInfo?: RemoteRepositoryInfo;
    dependencyFileExtension: string;
    dependencyFolderExclusion: string;
    vulnerabilityThreshold: boolean;
    highThreshold?: number;
    mediumThreshold?: number;
    lowThreshold?: number;
}