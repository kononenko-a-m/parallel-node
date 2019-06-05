const { parentPort, workerData } = require('worker_threads');
const processImage = require('../process-image');

processImage(workerData.buffer)
    .then(buffer => parentPort.postMessage(buffer));