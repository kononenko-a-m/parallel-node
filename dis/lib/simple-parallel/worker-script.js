const fs = require('fs');
const { parentPort, workerData } = require('worker_threads');
const processImage = require('../process-image');

const imageBuffer = fs.readFileSync('./assets/10mb_image.jpg');

processImage(imageBuffer)
    .then(buffer => parentPort.postMessage(buffer));