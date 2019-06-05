const {
    Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

if (isMainThread) {
    module.exports = function spawnThread(bufferView) {
        const worker = new Worker(__filename, {
            workerData: bufferView
        });

        worker.on('error', (err) => console.error('Error in worker thread', err));

        return {
            exec(fn, ...buffers) {
                return new Promise((fulfil, reject) => {
                    worker.postMessage({
                        fn: fn.toString(),
                        params: buffers
                    }, buffers);
                    worker.once('message', fulfil);
                    worker.once('error', reject);
                });
            }
        };
    };
} else {
    parentPort.on('message', ({ fn, params }) => {
        const compiledFunc = new Function(`return (${fn})(...arguments);`);
        const result = compiledFunc(workerData, ...params);

        if (result instanceof Promise) {
            result.then(resolved => {
                parentPort.postMessage(resolved);
            });
        } else {
            parentPort.postMessage(result);
        }
    });
}
