const axios = require('axios');
const fs = require('fs');

async function downloadFile(url, path, fileName, override = false) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  const fileLocalPath = `${path}/${fileName}`;

  if (!override) {
    const existLocalApp = fs.existsSync(fileLocalPath);
    if (existLocalApp) {
      console.log(`App ${fileLocalPath} already downloaded`);
      return fileLocalPath;
    }
  }

  console.log(`Downloading file from ${url} to ${fileLocalPath}`);

  let downloadResponse = null;
  try {
    downloadResponse = await axios({
      url: url,
      method: 'GET',
      responseType: 'stream',
    });
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
}

module.exports.download = downloadFile;
