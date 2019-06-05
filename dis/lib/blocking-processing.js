const fs = require('fs');
const processImage = require('./process-image');

const imageBuffer = fs.readFileSync('./assets/10mb_image.jpg');

module.exports = function () {
    return processImage(imageBuffer);
};