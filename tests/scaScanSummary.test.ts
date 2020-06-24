import { ScaSummaryEvaluator } from "../src/services/scaSummaryEvaluator";
import { HttpClient, ScaConfig, ScanResults } from "../src";
import { ScanConfig } from "../src";
import { SastConfig } from "../src";
import { Logger } from "../src";
import * as assert from "assert";
import { ScaClient } from "../src/services/clients/scaClient";
import { SourceLocationType } from '../src';
import { RemoteRepositoryInfo } from '../src';

describe("ScaScanSummary", function () {
    it('should return threshold errors in summary', function () {
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

    it('should not return threshold errors if all values are below thresholds', function () {
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

function getScanConfig(): ScanConfig {
    return {
        sourceLocation: "",
        projectName: "",
        projectId: 0,
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
    remoteRepositoryInfo.url = 'https://github.com/checkmarx-ltd/Cx-Client-Common.git';
    return {
        apiUrl: '',
        accessControlUrl: '',
        username: '',
        password: '',
        tenant: '',
        webAppUrl: '',
        sourceLocationType: SourceLocationType.REMOTE_REPOSITORY,
        remoteRepositoryInfo: remoteRepositoryInfo,
        dependencyFileExtension: '',
        dependencyFolderExclusion: '',
        vulnerabilityThreshold: false,
        highThreshold: 0,
        mediumThreshold: 0,
        lowThreshold: 0
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
        debug() {
        },
        error() {
        },
        info() {
        },
        warning() {
        }
    };
}
