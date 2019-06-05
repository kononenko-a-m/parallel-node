const Jimp = require('jimp');

module.exports = function processImage(imageBuffer) {
    return Jimp.read(imageBuffer)
        .then(img => {
            return img.resize(100, 100)
                .quality(60)
                .getBufferAsync(Jimp.MIME_JPEG);
        });
};