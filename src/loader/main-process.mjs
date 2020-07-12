import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import se from 'serialize-error';

import cache from 'iep-cache';
import pubsub from 'iep-pubsub';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const childProcess = path.resolve(__dirname, 'child-process.mjs');
const loaderHooks = path.resolve(__dirname, 'loader-hooks.mjs');

const serviceMap = {};

const { publish, once } = pubsub();

export default ({ iep: { serverEntry }, 'iep-cache': conf }) => {
  const iepMap = cache('iepMap', conf);
  const iepSrc = cache('iepSrc', conf);

  let requestSequenceNo = 1;
  return [
    iepMap,
    iepSrc,
    (ticket, buffer) => {
      const child = serviceMap[ticket] || worker(ticket, conf);
      const { publish } = pubsub(child);
      const requestId = requestSequenceNo++;
      publish('render', {
        ticket,
        serverEntry,
        buffer,
        requestId,
      });
      return new Promise((resolve, reject) => {
        once('render', (channel, { responseId, buffer, err }) => {
          if (err) {
            return reject(se.deserializeError(JSON.parse(err)));
          }
          if (requestId === responseId) {
            resolve(buffer);
          }
        });
      });
    },
  ];
};

export const restart = (ticket) => {
  if (serviceMap[ticket]) {
    serviceMap[ticket].kill();
    Reflect.deleteProperty(serviceMap, ticket);
  }
};

const worker = (ticket, conf) => {
  const child = fork(
    childProcess,
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
        // '--trace-warnings',
        // '--no-warnings',
        // '--inspect-brk=localhost:9222',
      ],
    }
  );

  const { subscribe } = pubsub(child);

  // broadcast to all siblings
  subscribe('render', publish);
  subscribe('iepMap', publish);
  subscribe('iepSrc', publish);

  return (serviceMap[ticket] = child);
};
