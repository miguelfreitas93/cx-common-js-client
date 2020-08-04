import * as fs from 'fs';
import { walk } from 'walk';
import * as upath from 'upath';
import { Logger } from '../..';
import ScanFingerprints from './fingerprints/scanFingerprints';
import FileFingerprint from './fingerprints/fileFingerprint';
import Sha1Signature from './fingerprints/signatures/sha1.signature';
import { FilePathFilter } from '../../services/filePathFilter';

export class ScaFingerprintCollector {
    private fingerprintsCollection!: ScanFingerprints;

    constructor(private readonly log: Logger,
                private readonly filenameFilter: FilePathFilter) {}

    public collectFingerprints(srcPath: string): Promise<ScanFingerprints> {
        return new Promise<ScanFingerprints>((resolve, reject) => {
            this.fingerprintsCollection = new ScanFingerprints();

            if (fs.lstatSync(srcPath).isDirectory()) {
                this.log.debug('Discovering files in source directory.');
                // followLinks is set to true to conform to Common Client behavior.
                const walker = walk(srcPath, { followLinks: true });

                walker.on('file', (parentDir: string, fileStats: any, discoverNextFile: () => void) => this.getFileFingerprint(srcPath, parentDir, fileStats, discoverNextFile));

                walker.on('end', () => {
                    this.log.debug('Finished collecting fingerprints.');

                    resolve(this.fingerprintsCollection);
                });
            }
        });
    }

    private getFileFingerprint = (srcDir: string, parentDir: string, fileStats: any, discoverNextFile: () => void) => {
        const absoluteFilePath = upath.resolve(parentDir, fileStats.name);
        const relativeFilePath = upath.relative(srcDir, absoluteFilePath);

        if (this.filenameFilter.includes(relativeFilePath)) {
            this.log.debug(`Collecting Fingerprint: ${ absoluteFilePath }`);

            const relativePath = upath.relative(srcDir, parentDir) ? `${ upath.relative(srcDir, parentDir) }/${ fileStats.name }` : fileStats.name;
            const size = fileStats['size'];
            const fileContent = fs.readFileSync(absoluteFilePath);
            const sha1FileSignature = new Sha1Signature(Uint8Array.from(fileContent));
            const fileFingerprint = new FileFingerprint(relativePath, size, [sha1FileSignature]);
            this.fingerprintsCollection.fingerprints.push(fileFingerprint);
        }

        discoverNextFile();
    };
}