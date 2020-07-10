import test from 'ava';
import { transformSource } from '../loader-hooks.mjs';

import defaultTransformSource from 'defaultTransformSource?__fake';
import resolver from '../../resolver/index.mjs?__fake';
import cache, { IEP_STR } from 'iep-cache?__fake=./fakes/iep-cache.mjs';

test.serial('defer to default', async (t) => {
  await transformSource(
    'export default source',
    { url: '' },
    defaultTransformSource
  );

  t.is(defaultTransformSource.mocks().calls, 1);
});

test.serial('resolve new source', async (t) => {
  const map = {};
  cache('iepMap', { map });
  cache('iepSrc', { map });

  await transformSource(
    'export default source',
    { url: 'file:///?__iep=tkt-1' },
    defaultTransformSource
  );

  const mocks = resolver.mocks();
  t.is(mocks.values[2], map);
  t.deepEqual(mocks, {
    calls: 1,
    values: ['export default source', '/', map, 'file:///?__iep=tkt-1'],
  });
});

test.serial('re-resolve cache busted source', async (t) => {
  cache('iepMap', { timestamp: 2 });
  cache('iepSrc', { timestamp: 1, [IEP_STR]: 'cached source' });

  const { source } = await transformSource(
    'export default source',
    { url: 'file:///?__iep=tkt-1' },
    defaultTransformSource
  );

  t.is(source, 'export default source');
  t.is(resolver.mocks().calls, 1);
});

test.serial('return cached', async (t) => {
  cache('iepMap', { timestamp: 1 });
  cache('iepSrc', { timestamp: 2 });

  await transformSource(
    'cached source',
    { url: 'file:///?__iep=tkt-1' },
    defaultTransformSource
  );

  t.is(defaultTransformSource.mocks().calls, 0);
  t.is(resolver.mocks().calls, 0);
});
