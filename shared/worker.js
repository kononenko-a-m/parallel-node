const { parentPort } = require('worker_threads');
const fs = require('fs/promises');

const filesToRead = new Array(10)
    .fill(null)
    .map((_, i) => `./files/enwik8-${i + 11}.pmd`);

parentPort.on('message', (e) => {
    if (e === 'start') {
        console.log('worker', 'start reading', Date.now());
        Promise.all(filesToRead.map(filePath => fs.readFile(filePath, 'utf8')))
            .then(() => {
                console.log('worker', 'reading complete', Date.now());
            });
    }
});