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

export default ({ iep: { serverEntry }, 'iep-cache': conf }) => {
  const iepMap = cache('iepMap', conf);
  const iepSrc = cache('iepSrc', conf);

  let requestSequenceNo = 1;
  return [
    iepMap,
    iepSrc,
    (ticket, buffer) => {
      const child = serviceMap[ticket] || worker(ticket, conf);
      const { publish, once } = pubsub(child);
      const requestId = requestSequenceNo++;
      publish(ticket, {
        ticket,
        serverEntry,
        buffer,
        requestId,
      });
      return new Promise((resolve, reject) => {
        once(ticket, ({ responseId, buffer, err }) => {
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
      `--ticket=${ticket}`,
      `--cache-lazy-load=true`,
      `--cache-entity-key=${conf['cache-entity-key'] || 'source'}`,
      conf['cache-persist-url']
        ? `--cache-persist-url=${conf['cache-persist-url']}`
        : '',
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

  return (serviceMap[ticket] = child);
};
