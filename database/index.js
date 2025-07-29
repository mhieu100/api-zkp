const fs = require('fs').promises;
const path = require('path');

const storagePath = path.join(__dirname, 'storages');

async function readData(fileName) {
  try {
    const filePath = path.join(storagePath, fileName);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    throw error;
  }
}

async function writeData(fileName, data) {
  const filePath = path.join(storagePath, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readData,
  writeData,
};