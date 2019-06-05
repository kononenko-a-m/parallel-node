const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');

/**
 *
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

const imageAsArray = bufferToShared(fs.readFileSync('./assets/10mb_image.jpg'));

module.exports = function sharedParallelImageProcessing() {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, 'worker-script.js'), {
            workerData: imageAsArray
        });
        worker.on('message', resolve);
        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
};