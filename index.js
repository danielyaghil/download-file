const axios = require('axios');
const fs = require('fs');

async function downloadFile(url, path, fileName, options) {
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

        const fileLocalPath = `${path}/${fileName}`;

        if (options && !options.override) {
            const existLocalApp = fs.existsSync(fileLocalPath);
            if (existLocalApp) {
                console.log(`App ${fileLocalPath} already downloaded`);
                return fileLocalPath;
            }
        }

        console.log(`Downloading file from ${url} to ${fileLocalPath}`);

        let downloadResponse = null;
        try {
            const axiosOpts = {
                url: url,
                method: 'GET',
                responseType: 'stream'
            };
            if (options && options.auth) {
                axiosOpts.auth = options.auth;
            }
            downloadResponse = await axios(axiosOpts);
        } catch (error) {
            console.error(`Error downloading file ${url}: ${error}`);
            return null;
        }

        console.log(`Download response status: ${downloadResponse.status}`);
        console.log(`Starting saving file to ${fileLocalPath}`);

        const writer = fs.createWriteStream(fileLocalPath);
        downloadResponse.data.pipe(writer);

        const promise = new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        return promise
            .then(() => {
                console.log(`File downloaded successfully ${fileLocalPath}`);
                return fileLocalPath;
            })
            .catch((error) => {
                console.error(`Error downloading file ${url}: ${error}`);
                return null;
            });
    } catch (error) {
        console.error(`Error downloading file ${url} to ${path}/${fileName}: ${error}`);
        return null;
    }
}

module.exports.download = downloadFile;
