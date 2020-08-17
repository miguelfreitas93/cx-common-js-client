import { Logger } from '../src';
import * as assert from 'assert';
import Sha1Signature from '../src/dto/sca/fingerprints/signatures/sha1';
import * as fs from 'fs';

describe('SHA1 signature', () => {
    it('should calculate file sha1 signature', function () {
        try {
            //---------------------------------------------------------------------------//
            // You need to specify a file in your local machine and compare it's sha1 value,
            // I used this sha1 calculator: https://emn178.github.io/online-tools/sha1_checksum.html
            const fileContent = fs.readFileSync('NEED TO SPECIFY A FILE PATH');
            //---------------------------------------------------------------------------//

            const sha1FileSignature = new Sha1Signature(Uint8Array.from(fileContent));

            assert.equal(sha1FileSignature.value, 'NEED TO SPECIFY SHA1 VALUE');
        } catch (e) {
            console.error('You need to specify a file and it\'s sha1 value')
        }
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
