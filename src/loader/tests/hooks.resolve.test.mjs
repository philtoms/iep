import test from 'ava';
import { resolve } from '../loader-hooks.mjs';

import defaultResolve from 'defaultResolve?__fake=mock(url=>({url:`file://${url}`}))';
import cache from 'iep-cache?__fake=./fakes/iep-cache.mjs';

process.env.APP_ROOT = '/app';
test.serial(
  'defer to defaultResolve for un-registered specifiers',
  async (t) => {
    await resolve('fs', {}, defaultResolve);

    const mocks = defaultResolve.mocks();

    t.is(mocks.calls, 1);
    t.deepEqual(mocks.values, ['fs', {}, defaultResolve]);
  }
);

test.serial('defer registered specifier to defaultResolve', async (t) => {
  cache('iepMap', { map: { imports: {} } });

  defaultResolve.reset();
  await resolve('/xxx?__iep=tkt-1', {}, defaultResolve);

  const mocks = defaultResolve.mocks();

  t.is(mocks.calls, 1);
  t.deepEqual(mocks.values, ['/app/xxx', {}, defaultResolve]);
});

test.serial('extract ticket details from imports', async (t) => {
  cache('iepMap', { map: { imports: { xxx: '/yyy' } } });
  const { url } = await resolve('xxx?__iep=tkt-1', {}, defaultResolve);

  t.is(url, 'file:///app/yyy?__iep=tkt-1');
});
