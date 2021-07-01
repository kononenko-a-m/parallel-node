const { Worker } = require('worker_threads');
const http = require('http');
const fs = require('fs/promises');

const filesToRead = new Array(10)
    .fill(null)
    .map((_, i) => `./files/enwik8-${i + 1}.pmd`);

const worker = new Worker('./worker.js');
const server = http.createServer(function (req, res) {
    worker.postMessage('start');

    console.log('main', 'start reading', Date.now());
    Promise.all(filesToRead.map(filePath => fs.readFile(filePath, 'utf8')))
        .then(() => {
            console.log('main', 'reading complete', Date.now());
            res.writeHead(200);
            res.end('Hello, World!');
        });
});

server.listen(1212);