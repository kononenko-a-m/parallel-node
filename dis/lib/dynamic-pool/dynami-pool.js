const { Worker } = require('worker_threads');
const path = require('path');

const MAX_INACTIVE_TTL = 5000;

module.exports = class DynamicPool {
    workers = [];
    availableWorkers = new Map();

    get hasAvailableWorkers() {
        return Boolean(this.availableWorkers.size);
    }

    run(module, params) {
        const worker = this.hasAvailableWorkers
            ? this.getWorker()
            : this.createWorker();

        worker.postMessage({
            action: 'RUN_MODULE',
            module,
            params
        });

        return new Promise(fulfil => {
            worker.once('message', result => {
                this.returnWorker(worker);
                fulfil(result);
            });
        });
    }

    returnWorker(worker) {
        this.availableWorkers.set(
            worker,
            setTimeout(() => this.removeWorker(worker), MAX_INACTIVE_TTL)
        );
    }

    getWorker() {
        const worker = this.availableWorkers.keys().next().value;
        clearTimeout(this.availableWorkers.get(worker));
        this.availableWorkers.delete(worker);
        return worker;
    }

    createWorker() {
        const worker = new Worker(path.resolve(__dirname, 'worker-script.js'));

        worker.on('error', (err) => {
            console.error(`Error in worker thread ${err}`);
            this.removeWorker(worker);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }

            this.removeWorker(worker);
        });

        this.workers.push(worker);

        return worker;
    }

    removeWorker(worker) {
        const workerPos = this.workers.indexOf(worker);
        this.availableWorkers.delete(worker);

        if (workerPos !== -1) {
            worker.postMessage({ action: 'STOP' });
            worker.unref();
            this.workers.splice(workerPos, 1);
        }
    }
};