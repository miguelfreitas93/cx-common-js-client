import Signature from './signatures/signature';

export default class FileFingerprint {
    path: string;
    size: number;
    signatures: Signature[];

    constructor(path: string, size: number, signatures: Signature[]) {
        this.path = path;
        this.size = size;
        this.signatures = signatures;
    }
}