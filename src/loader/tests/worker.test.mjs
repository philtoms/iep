import test from 'ava';

import worker from '../worker.mjs';
import 'serverEntry?__fake';
import 'badServerEntry?__fake=() => abc';
import send from 'send?__fake';

let workerCB;
const pubsub = {
  on: (message, cb) => (workerCB = cb),
  send,
};

test.serial(
  'worker receives request message and sends id-aligned response',
  async (t) => {
    worker(pubsub);

    await workerCB({
      ticket: 'tkt-1',
      serverEntry: 'serverEntry',
      buffer: 'xxx',
      requestId: 1,
    });

    const response = send.mocks();
    t.is(response.calls, 1);
    t.is(response.values[0].responseId, 1);
  }
);

test.serial('worker accepts serverEntry with query', async (t) => {
  worker(pubsub);

  await workerCB({
    ticket: 'tkt-1',
    serverEntry: 'serverEntry?x=1&y=2',
    buffer: 'xxx',
    requestId: 1,
  });

  const response = send.mocks();
  t.is(response.calls, 1);
  t.is(response.values[0].responseId, 1);
});

test.serial(
  'worker receives request message and bombs in child-land',
  async (t) => {
    worker(pubsub);

    await workerCB({
      ticket: 'tkt-1',
      serverEntry: 'badServerEntry',
      buffer: 'xxx',
      requestId: 2,
    });

    const response = send.mocks();
    t.assert(response.values[0].err);
  }
);
