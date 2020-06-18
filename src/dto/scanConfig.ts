import { ScaConfig } from './sca/scaConfig';
import { SastConfig } from './sastConfig';

export interface ScanConfig {
    sourceLocation: string;
    projectName: string;
    projectId?: number;
    enableSastScan: boolean;
    enableDependencyScan: boolean;
    cxOrigin: string;
    sastConfig?: SastConfig;
    scaConfig?: ScaConfig;
}