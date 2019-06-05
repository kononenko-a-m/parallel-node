const http = require('http');
// const processImage = require('./lib/process-image');
const threadPoolImageProcessing = require('./lib/thread-pool');
const { performance } = require('perf_hooks');

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 9900;

function* idSequence() {
    let counter = 0;
    while (true) {
        yield ++counter;
    }
}

const idGenerator = idSequence();

const server = http.createServer((req, res) => {
    const generated = idGenerator.next();
    const start = performance.now();

    console.log('Request received', generated.value);
    threadPoolImageProcessing()
        .then( data => {
            res.writeHead(200, {'Content-Type': 'image/jpg' });
            res.end(Buffer.from(data), 'binary');
        })
        .catch( err => {
            res.writeHead(500);
            res.end(err.message);
        })
        .then(() => {
            console.log('Request finished', generated.value, 'time: ', performance.now() - start);
        });
});

server.listen(port, () => {
    console.log('App started on', port);
});