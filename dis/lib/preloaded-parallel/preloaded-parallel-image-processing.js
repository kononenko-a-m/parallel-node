const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');

const imageBuffer = fs.readFileSync('./assets/10mb_image.jpg');

module.exports = function preloadedParallelImageProcessing() {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, 'worker-script.js'), {
            workerData: imageBuffer
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