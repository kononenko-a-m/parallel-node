const processImage = require('../process-image');

module.exports = function (arrayBuff) {
    return processImage(arrayBuff.buffer);
};