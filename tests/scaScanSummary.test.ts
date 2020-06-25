import { ScaSummaryEvaluator } from "../src/services/scaSummaryEvaluator";
import { ScaConfig, ScanResults } from "../src";
import { ScanConfig } from "../src";
import { SastConfig } from "../src";
import { Logger } from "../src";
import * as assert from "assert";
import { SourceLocationType } from '../src';
import { RemoteRepositoryInfo } from '../src';
import { CxClient } from '../src';

describe("Sca Scan Summary", () => {
    it('should return threshold errors in summary', () => {
        const config = getScaConfig();
        config.vulnerabilityThreshold = true;
        config.highThreshold = 1;
        config.mediumThreshold = 5;
        config.lowThreshold = 10;

        const target = new ScaSummaryEvaluator(config);

        const vulResults = {
            highResults: 3,
            mediumResults: 8,
            lowResults: 4
        };
        const summary = target.getScanSummary(vulResults);

        assert.ok(summary.hasThresholdErrors());
        assert.equal(summary.thresholdErrors.length, 2);
    });

    it('should not return threshold errors if all values are below thresholds', () => {
        const config = getScaConfig();
        config.vulnerabilityThreshold = true;
        config.highThreshold = 10;
        config.mediumThreshold = 15;
        config.lowThreshold = 20;

        const target = new ScaSummaryEvaluator(config);

        const vulResults = {
            highResults: 2,
            mediumResults: 11,
            lowResults: 18
        };
        const summary = target.getScanSummary(vulResults);

        assert.ok(!summary.hasThresholdErrors());
        assert.equal(summary.thresholdErrors.length, 0);
    });
});

describe("Sca Scan On Remote Source", () => {

    const cxClient: CxClient = new CxClient(getDummyLogger());
    const config: ScanConfig = getScanConfig();
    config.projectName = 'ScaUnitTest';
    const scaConfig = config.scaConfig;
    if (scaConfig && scaConfig.remoteRepositoryInfo) {
        scaConfig.remoteRepositoryInfo.url = 'https://github.com/margaritalm/SastAndOsaSource.git';
    }

    it('should return results when running on sync mode', async () => {
        config.isSyncMode = true;
        const scanResults: ScanResults = await cxClient.scan(config);
        const scaResults = scanResults.scaResults;
        assert.equal(scanResults.syncMode, true);
        assert.ok(scaResults);
        if (scaResults) {
            assert.equal(scaResults.resultReady, true);
            assert.notEqual(scaResults.highVulnerability, 0);
            assert.notEqual(scaResults.mediumVulnerability, 0);
            assert.notEqual(scaResults.lowVulnerability, 0);
        }
    });

    it('should not return results when running on async mode', async () => {
        config.isSyncMode = false;
        const scanResults: ScanResults = await cxClient.scan(config);
        assert.equal(scanResults.syncMode, false);
        assert.ok(!scanResults.scaResults);
    });
});

function getScanConfig(): ScanConfig {
    return {
        sourceLocation: "",
        projectName: "",
        enableSastScan: false,
        enableDependencyScan: true,
        cxOrigin: "JsCommon",
        sastConfig: getSastConfig(),
        scaConfig: getScaConfig(),
        isSyncMode: false
    };
}

function getScaConfig(): ScaConfig {
    const remoteRepositoryInfo: RemoteRepositoryInfo = new RemoteRepositoryInfo();
    remoteRepositoryInfo.url = '';

    return {
        //---------------------------------------------------------------------------//
        // The following attributes are not populated because they are sensitive.
        // To make relevant tests work, you need to populate them locally only.
        // Please don't commit them to github.
        apiUrl: '',
        accessControlUrl: '',
        username: '',
        password: '',
        tenant: '',
        webAppUrl: '',
        //---------------------------------------------------------------------------//
        sourceLocationType: SourceLocationType.REMOTE_REPOSITORY,
        remoteRepositoryInfo: remoteRepositoryInfo,
        dependencyFileExtension: '',
        dependencyFolderExclusion: '',
        vulnerabilityThreshold: false
    };
}

function getSastConfig(): SastConfig {
    return {
        username: "",
        password: "",
        teamName: "",
        teamId: 0,
        serverUrl: "",
        isPublic: false,
        denyProject: false,
        folderExclusion: "",
        fileExtension: "",
        isIncremental: false,
        forceScan: false,
        comment: "",
        presetName: "",
        presetId: 0,
        scanTimeoutInMinutes: 0,
        enablePolicyViolations: false,
        vulnerabilityThreshold: false,
        highThreshold: 0,
        mediumThreshold: 0,
        lowThreshold: 0
    };
}

function getDummyLogger(): Logger {
    return {
        debug(message: string) {
            console.debug(message);
        },
        error(message: string) {
            console.error(message);
        },
        info(message: string) {
            console.info(message);
        },
        warning(message: string) {
            console.warn(message);
        }
    };
}
