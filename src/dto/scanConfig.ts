import { ScaConfig } from "./sca/scaConfig";

export interface ScanConfig {
    enableSastScan: boolean;
    username: string;
    password: string;
    sourceLocation: string;
    projectName: string;
    projectId?: number;
    teamName: string;
    teamId?: number;
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
    presetId?: number;
    scanTimeoutInMinutes?: number;

    enablePolicyViolations: boolean;
    vulnerabilityThreshold: boolean;

    highThreshold?: number;
    mediumThreshold?: number;
    lowThreshold?: number;
    cxOrigin: string;
    enableDependencyScan: boolean;
    scaConfig?: ScaConfig;
}