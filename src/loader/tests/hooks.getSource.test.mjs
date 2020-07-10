import test from 'ava';
import { getSource } from '../loader-hooks.mjs';

import defaultGetSource from 'defaultGetSource?__fake=mock(url=>({source:"export default source"}))';

import cache, { IEP_STR } from 'iep-cache?__fake=./fakes/iep-cache.mjs';

test.serial('defer to default', async (t) => {
  t.deepEqual(await getSource('fs', {}, defaultGetSource), {
    source: 'export default source',
  });
  t.is(defaultGetSource.mocks().calls, 1);
});

test.serial('return cached', async (t) => {
  cache('iepMap', { timestamp: 1 });
  cache('iepSrc', { timestamp: 2, [IEP_STR]: 'cached source' });
  const { source } = await getSource(
    'file:///xxx?__iep=tkt-1',
    {},
    defaultGetSource
  );
  t.is(defaultGetSource.mocks().calls, 0);
  t.is(source, 'cached source');
});
