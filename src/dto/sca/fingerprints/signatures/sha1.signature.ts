import * as crypto from 'crypto';
import Signature from './signature';

export default class Sha1Signature implements Signature {
    type: string = 'SHA1';
    value: string;

    constructor(data: any) {
        this.value = crypto.createHash('sha1').update(data).digest('hex');
    }
}