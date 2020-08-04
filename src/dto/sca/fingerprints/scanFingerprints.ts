import FileFingerprint from './fileFingerprint';

export default class ScanFingerprints {
    public static CURRENT_SCAN_FINGERPRINT_VERSION = '1.0.0';

    version: string = '1.0.0';
    time: string = '';
    fingerprints: FileFingerprint[];

    constructor(version: string = '', fingerprints: FileFingerprint[] = []) {
        this.version = version || ScanFingerprints.CURRENT_SCAN_FINGERPRINT_VERSION;
        this.time = this.getTime();
        this.fingerprints = fingerprints || [];
    }

    private getTime() {
        // yyyy-MM-dd HH:mm:ss
        const now = new Date();
        return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    }
}