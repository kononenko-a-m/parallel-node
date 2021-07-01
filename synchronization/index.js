const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 9800;

const express = require('express');
const spawnThread = require('./lib/worker-thread/thread-factory');
const app = express();

const arrBuffer = new ArrayBuffer(16);
const arrBufferView = new Int32Array(arrBuffer);

arrBufferView[0] = 1;
arrBufferView[1] = 2;
arrBufferView[2] = 3;
arrBufferView[3] = 4;

const thread1 = spawnThread(arrBuffer);
const thread2 = spawnThread(arrBuffer);

app.get('/array-buffer/move-and-mutate', (req, res) => {
    function multiMutate(_, buffer) {
        const bufferView = new Int32Array(buffer);

        for (let i = 0; i < 10000; i++) {
            bufferView[0] = Math.round(Math.random() * 255);
            bufferView[1] = Math.round(Math.random() * 255);
            bufferView[2] = Math.round(Math.random() * 255);
            bufferView[3] = Math.round(Math.random() * 255);
        }

        return bufferView.buffer;
    }

    Promise.all([
        thread1.exec(multiMutate, arrBuffer),
        thread2.exec(multiMutate, arrBuffer)
    ]).then(([ response ]) => {

        res.json({
            arrBufferView: [ ...new Int32Array(response) ]
        });
    });
});


app.get('/array-buffer/compute-parallel', (req, res) => {
    arrBufferView[0] = 2;

    Promise.all([
        thread1.exec(function (buffer) {
            const bufferView = new Int32Array(buffer);
            for (let i = 0; i < 100000; i++) {
                bufferView[0] = bufferView[0] * -2;
            }
        }),
        thread2.exec(function (buffer) {
            const bufferView = new Int32Array(buffer);
            for (let i = 0; i < 100000; i++) {
                bufferView[0] = Math.sqrt(bufferView[0]);
            }
        })
    ]).then(() => {
        res.json({
            arrBufferView: [ ...arrBufferView ]
        });
    });
});

app.get('/array-buffer/compute-parallel-sync', (req, res) => {
    // set
    arrBufferView[0] = 2;
    arrBufferView[1] = 0;

    Promise.all([
        thread1.exec(function (buffer) {
            const bufferView = new Int32Array(buffer);
            for (let i = 0; i < 100000; i++) {
                Atomics.wait(bufferView, 1, 1);

                bufferView[0] = Math.abs(bufferView[0] * -2);

                Atomics.store(bufferView, 1, 1);
                Atomics.notify(bufferView, 1);
            }
        }),
        thread2.exec(function (buffer) {
            const bufferView = new Int32Array(buffer);
            for (let i = 0; i < 100000; i++) {
                Atomics.wait(bufferView, 1, 0);

                bufferView[0] = Math.sqrt(bufferView[0]);

                Atomics.store(bufferView, 1, 0);
                Atomics.notify(bufferView, 1);
            }
        })
    ]).then(() => {
        res.json({
            arrBufferView: [ ...arrBufferView ]
        });
    });
});


app.get('/array-buffer/compute-parallel-sync-trans', (req, res) => {
    // set
    arrBufferView[0] = 2;
    arrBufferView[1] = 0;

    Promise.all([
        thread1.exec(function (buffer) {
            const bufferView = new Int32Array(buffer);
            function transaction(lockValue) {
                return (op) => {
                    Atomics.wait(bufferView, 1, lockValue);
                    op();
                    Atomics.store(bufferView, 1, lockValue);
                    Atomics.notify(bufferView, 1);
                }
            }

            const safeTransaction = transaction(1);

            for (let i = 0; i < 100000; i++) {
                safeTransaction(() => {
                    bufferView[0] = Math.abs(bufferView[0] * -2);
                });
            }
        }),
        thread2.exec(function (buffer) {
            const bufferView = new Int32Array(buffer);
            function transaction(lockValue) {
                return (op) => {
                    Atomics.wait(bufferView, 1, lockValue);
                    op();
                    Atomics.store(bufferView, 1, lockValue);
                    Atomics.notify(bufferView, 1);
                }
            }

            const safeTransaction = transaction(0);

            for (let i = 0; i < 100000; i++) {
                safeTransaction(() => {
                    bufferView[0] = Math.sqrt(bufferView[0]);
                });
            }
        })
    ]).then(() => {
        res.json({
            arrBufferView: [ ...arrBufferView ]
        });
    });
});

app.get('/array-buffer/mutate-parallel', (req, res) => {
    function multiMutate(buffer) {
        const bufferView = new Int32Array(buffer);

        for (let i = 0; i < 10000; i++) {
            bufferView[0] = Math.round(Math.random() * 255);
            bufferView[1] = Math.round(Math.random() * 255);
            bufferView[2] = Math.round(Math.random() * 255);
            bufferView[3] = Math.round(Math.random() * 255);
        }
    }

    Promise.all([
        thread1.exec(multiMutate),
        thread2.exec(multiMutate)
    ]).then(() => {
        res.json({
            arrBufferView: [ ...arrBufferView ]
        });
    });
});

app.get('/array-buffer/mutate', (req, res) => {
    arrBufferView[0] = Math.round(Math.random() * 255);
    arrBufferView[1] = Math.round(Math.random() * 255);
    arrBufferView[2] = Math.round(Math.random() * 255);
    arrBufferView[3] = Math.round(Math.random() * 255);

    res.json({
        arrBufferView: [ ...arrBufferView ]
    });
});

app.get('/array-buffer/print', (req, res) => {
    function fetch(workerData) {
        return workerData;
    }

    Promise.all([
        thread1.exec(fetch),
        thread2.exec(fetch)
    ]).then(([thread1Response, thread2Response]) => {
        res.json({
            arrBufferView: [ ...arrBufferView ],
            thread1Response: [ ...new Int32Array(thread1Response) ],
            thread2Response: [ ...new Int32Array(thread2Response) ]
        });
    });
});

app.listen(port);