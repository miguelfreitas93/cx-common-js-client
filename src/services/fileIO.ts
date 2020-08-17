import * as fs from 'fs';

export default class FileIO {
    public static writeToFile = (fileLocation: string, data: any) => {
        if (!fileLocation)
            throw Error(`Required argument fileLocation.`);

        let json = JSON.stringify(data, null, 4);

        fs.writeFile(fileLocation, json, 'utf8', (err) => {
            if (err)
                throw Error(err.message);
        });
    };

    public static moveFile = (oldLocation: string, newLocation: string) => {
        if (!oldLocation || !newLocation)
            throw Error(`Required arguments oldLocation or newLocation is missing.`);

        fs.rename(oldLocation, newLocation, (err) => {
            if (err)
                throw Error(err.message);
        });
    };
}