const { parentPort } = require('worker_threads');

parentPort.on('message', (command) => {
    switch (command.action) {
        case 'RUN_MODULE':
            require(command.module)(command.params)
                .then((result) => parentPort.postMessage(result));
            break;
        case 'STOP':
            parentPort.off('message');
    }
});