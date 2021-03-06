import {ScanSummaryEvaluator} from "../src/services/scanSummaryEvaluator";
import {HttpClient, ScaConfig, ScanResults} from "../src";
import {ScanConfig} from "../src";
import {Logger} from "../src";
import * as assert from "assert";
import {ScaClient} from "../src/services/clients/scaClient";

describe("ScaScanSummary", function () {
    it('a result should be returned', function () {
        const config = getScanConfig();
        //config.enablePolicyViolations = true;

        //const target = new ScanSummaryEvaluator(config, getDummyLogger(), true);

        const scanResults = new ScanResults(config);
        scanResults.sastPolicies = ['policy1', 'policy2'];
        const summary = target.getScanSummary(scanResults);

        assert.ok(summary);
        assert.ok(summary.hasErrors());
        assert.ok(summary.policyCheck);
        assert.ok(summary.policyCheck.wasPerformed);
        assert.deepStrictEqual(summary.policyCheck.violatedPolicyNames, scanResults.sastPolicies);
    });

    it(' an error should be thrown',function () {
        const config = getScanConfig();
        config.scaConfig = getScaConfig();
        const scaClient = new ScaClient(config.scaConfig,new HttpClient(),getDummyLogger())
    });

    it('should return threshold errors in summary', function () {
        const config = getScanConfig();
        config.highThreshold = 1;
        config.mediumThreshold = 5;
        config.lowThreshold = 10;
        config.vulnerabilityThreshold = true;

        const target = new ScanSummaryEvaluator(config, getDummyLogger(), false);

        const scanResults = new ScanResults(config);
        scanResults.highResults = 3;
        scanResults.mediumResults = 8;
        scanResults.lowResults = 4;
        const summary = target.getScanSummary(scanResults);

        assert.ok(summary.hasErrors());
        assert.equal(summary.thresholdErrors.length, 2);
    });

    it('should not return threshold errors if all values are below thresholds', function(){
        const config = getScanConfig();
        config.highThreshold = 10;
        config.mediumThreshold = 15;
        config.lowThreshold = 20;
        config.vulnerabilityThreshold = true;

        const target = new ScanSummaryEvaluator(config, getDummyLogger(), false);

        const scanResults = new ScanResults(config);
        scanResults.highResults = 2;
        scanResults.mediumResults = 11;
        scanResults.lowResults = 18;
        const summary = target.getScanSummary(scanResults);

        assert.ok(!summary.hasErrors());
        assert.equal(summary.thresholdErrors.length, 0);
    });
});

function getScanConfig(): ScanConfig {
    return {
        cxOrigin: "JsCommon",
        enableDependencyScan: true,
        enableSastScan: false,
        highThreshold: 0,
        lowThreshold: 0,
        mediumThreshold: 0,
        presetId: 0,
        projectId: 0,
        scaConfig: undefined,
        scanTimeoutInMinutes: 0,
        teamId: 0,
        comment: "",
        denyProject: false,
        enablePolicyViolations: false,
        fileExtension: "",
        folderExclusion: "",
        forceScan: false,
        isIncremental: false,
        isPublic: false,
        isSyncMode: false,
        password: "",
        presetName: "",
        projectName: "",
        serverUrl: "",
        sourceLocation: "",
        teamName: "",
        username: "",
        vulnerabilityThreshold: false
    };
}


function getScaConfig(): ScaConfig {
    return {
        accessControlUrl: "",
        apiUrl: "",
        dependencyFileExtension: "",
        dependencyFolderExclusion: "",
        password: "",
        tenant: "",
        username: "",
        webAppUrl: ""
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
