import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import se from 'serialize-error';

import cache from 'iep-cache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerService = path.resolve(__dirname, 'child');
const loaderHooks = path.resolve(__dirname, 'hooks');

const serviceMap = {};
const callbacks = [];
const workers = {
  send: (message) =>
    Object.values(serviceMap).forEach((worker) => worker.send(message)),
  on: (message, cb) => callbacks.push(cb),
};

// this is a worker process
if (process.argv.includes(workerService)) {
  serviceMap.process = process;
}

export default ({ iep: { serverEntry }, 'iep-cache': conf }) => {
  const iepMap = cache('iepMap', conf, workers);
  const iepSrc = cache('iepSrc', conf, workers);

  let workerSequenceNo = 1;
  return [
    iepMap,
    iepSrc,
    (ticket, buffer) => {
      const worker = serviceMap[ticket] || restart(ticket, conf);
      const requestId = workerSequenceNo++;
      worker.send({
        ticket,
        serverEntry,
        buffer,
        requestId,
      });
      return new Promise((resolve, reject) => {
        worker.on('message', ({ responseId, buffer, err }) => {
          if (err) {
            reject(se.deserializeError(JSON.parse(err)));
          }
          if (requestId === responseId) {
            resolve(buffer);
          }
        });
      });
    },
  ];
};

export const restart = (ticket, conf) => {
  if (serviceMap[ticket]) {
    serviceMap[ticket].kill();
  }

  const worker = fork(
    workerService,
    [
      `--cache-lazy-load=true`,
      `--cache-persist-url=${conf['cache-persist-url']}`,
      `--iepMap-persistance=${conf['iepMap-persistance']}`,
    ],
    {
      execArgv: [
        '--experimental-loader',
        loaderHooks,
        '--experimental-specifier-resolution=node',
        // '--no-warnings',
        // '--inspect-brk=localhost:9222',
      ],
    }
  );
  worker.on('message', (message) => {
    callbacks.forEach((cb) => cb(message));
    if (message.entity) {
      workers.send(message);
    }
  });

  return (serviceMap[ticket] = worker);
};
