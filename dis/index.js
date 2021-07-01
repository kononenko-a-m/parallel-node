const http = require('http');
const blockingProcessing = require('./lib/blocking-processing');
const simpleParallelProcessing = require('./lib/simple-parallel');
const preloadParallelProcessing = require('./lib/preloaded-parallel');
const sharedParallelProcessing = require('./lib/shared-parallel');
const threadProcessing = require('./lib/thread-pool');

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
    threadProcessing()
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