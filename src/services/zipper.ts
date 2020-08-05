import * as fs from 'fs';
import * as path from "path";
import archiver, { Archiver, ArchiverError, ProgressData } from 'archiver';
import { Logger } from "./logger";
import { walkSync } from "walk";
import { FilePathFilter } from "./filePathFilter";
import { ZipResult } from "../dto/zipResult";
import * as upath from 'upath';

export default class Zipper {
    private archiver!: Archiver;

    private srcDirs: string[] = [];

    private totalAddedFiles = 0;

    constructor(private readonly log: Logger,
        private readonly filenameFilter: FilePathFilter) {
    }

    zipDirectory(srcDirs: string[], targetPath: string): Promise<ZipResult> {
        this.srcDirs = srcDirs;
        this.totalAddedFiles = 0;

        return new Promise<ZipResult>((resolve, reject) => {
            this.archiver = this.createArchiver(reject);
            const zipOutput = this.createOutputStream(targetPath, resolve);
            this.archiver.pipe(zipOutput);

            Promise.all(this.srcDirs.map(srcDir => {
                new Promise((innerResolve, innerReject) => {
                    if (fs.lstatSync(srcDir).isDirectory()) {
                        this.log.debug('Discovering files in source directory.');
                        // followLinks is set to true to conform to Common Client behavior.
                        walkSync(srcDir, {
                            followLinks: true,
                            listeners: {
                                file: (parentDir: string, fileStats: any, discoverNextFile: () => void) => this.addFileToArchive(srcDir, parentDir, fileStats, discoverNextFile)
                            }
                        });
                    } else {
                        const index: number = srcDir.lastIndexOf(path.sep);
                        const fileName: string = srcDir.substring(index + 1);
                        if (this.filenameFilter.includes(fileName)) {
                            this.log.debug(` Add: ${ srcDir }`);
                            this.archiver.file(srcDir, {
                                name: fileName,
                                prefix: ''
                            });
                        } else {
                            this.log.debug(`Skip: ${ srcDir }`);
                        }
                    }
                }).then(() => this.log.debug(`Resolved ${ srcDir }`));
            })).then(() => {
                this.log.debug('Finalizing ZIP.');

                this.archiver.finalize();
            });
        });
    }

    private createArchiver(reject: any) {
        const result = archiver('zip', { zlib: { level: 9 } });

        result.on('warning', (err: ArchiverError) => {
            this.log.warning(`Archiver: ${err.message}`);
        });

        result.on('error', (err: ArchiverError) => {
            reject(err);
        });

        result.on('progress', (data: ProgressData) => {
            this.totalAddedFiles = data.entries.processed;
        });
        return result;
    }

    private createOutputStream(targetPath: string, resolve: (value: ZipResult) => void) {
        const result = fs.createWriteStream(targetPath);
        result.on('close', () => {
            const zipResult: ZipResult = {
                fileCount: this.totalAddedFiles
            };

            this.log.info(`Acrhive creation completed. Total bytes written: ${this.archiver.pointer()}, files: ${this.totalAddedFiles}.`);
            resolve(zipResult);
        });
        return result;
    }

    private addFileToArchive = (srcDir: string, parentDir: string, fileStats: any, discoverNextFile: () => void) => {
        const absoluteFilePath = upath.resolve(parentDir, fileStats.name);
        const relativeFilePath = upath.relative(srcDir, absoluteFilePath);

        // relativeFilePath is normalized to contain forward slashes independent of the current OS. Examples:
        //      page.cs                             - if page.cs is at the project's root dir
        //      services/internal/myservice.js      - if myservice.js is in a nested dir
        if (this.filenameFilter.includes(relativeFilePath)) {
            this.log.debug(` Add: ${absoluteFilePath}`);

            const relativeDirInArchive = upath.relative(srcDir, parentDir);
            this.archiver.file(absoluteFilePath, {
                name: fileStats.name,
                prefix: relativeDirInArchive
            });
        } else {
            this.log.debug(`Skip: ${absoluteFilePath}`);
        }

        discoverNextFile();
    };
}