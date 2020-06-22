import { ScaConfig } from "../dto/sca/scaConfig";
import { ScanSummary } from "../dto/scanSummary";
import { ScanSummaryEvaluator } from './scanSummaryEvaluator';

export class ScaSummaryEvaluator extends ScanSummaryEvaluator {
    constructor(private readonly config: ScaConfig) {
        super();
    }

    getScanSummary(scanResult: any): ScanSummary {
        const result = new ScanSummary();
        result.thresholdErrors = ScanSummaryEvaluator.getThresholdErrors(this.config.vulnerabilityThreshold, scanResult, this.config);
        return result;
    }
}