import { Logger } from '../src';
import * as assert from 'assert';
import Sha1Signature from '../src/dto/sca/fingerprints/signatures/sha1.signature';
import * as fs from 'fs';

describe('SHA1 signature', () => {
    it('should calculate file sha1 signature', function () {
        const fileContent = fs.readFileSync(`${ __dirname }\\tests-resources\\gson-2.2.2.jar`);

        const sha1FileSignature = new Sha1Signature(Uint8Array.from(fileContent));

        assert.equal(sha1FileSignature.value, '1f96456ca233dec780aa224bff076d8e8bca3908');
    });
});

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
