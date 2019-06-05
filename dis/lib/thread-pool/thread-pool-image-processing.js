const path = require('path');
const fs = require('fs');
const DynamicPool = require('../dynamic-pool/dynami-pool');

/**
* @param buffer Buffer
*/
function bufferToShared(buffer) {
    const shared = new SharedArrayBuffer(buffer.length);
    const sharedArray = new Uint8Array(shared);

    for (let i = 0; i < sharedArray.length; i++) {
        sharedArray[i] = buffer.readUInt8(i);
    }

    return sharedArray;
}

const dynamicPool = new DynamicPool();

const imageAsArray = bufferToShared(fs.readFileSync('./assets/10mb_image.jpg'));

module.exports = function threadPoolImageProcessing() {
    return dynamicPool.run(path.resolve(__dirname, 'worker-script.js'), imageAsArray);
};