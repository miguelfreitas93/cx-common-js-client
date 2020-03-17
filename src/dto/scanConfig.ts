import {ScaConfig} from "./scaConfig";

export interface ScanConfig {
    enableSastScan: boolean;
    username: string;
    password: string;
    sourceLocation: string;
    projectName: string;
    teamName: string;
    serverUrl: string;
    isPublic: boolean;
    denyProject: boolean;
    folderExclusion: string;
    fileExtension: string;
    isIncremental: boolean;
    forceScan: boolean;
    comment: string;
    isSyncMode: boolean;
    presetName: string;
    scanTimeoutInMinutes?: number;

    enablePolicyViolations: boolean;
    vulnerabilityThreshold: boolean;

    highThreshold?: number;
    mediumThreshold?: number;
    lowThreshold?: number;
    enableDependencyScan: boolean;
    scaConfig: ScaConfig;
}