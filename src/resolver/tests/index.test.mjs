import test from 'ava';
import resolve from '../index.mjs';

import 'fs?__fake=./fakes/fs.mjs';

const source = `
import 'packaged'
import 'builtin'
import 'mapped'
import '../relative'
import './sibling'
import '/absolute'
import '/path.js'
import '/implied'
import '/implied/unresolved' // unchanged
import '../../long/path.json' // unchanged
`;

const map = {
  imports: {
    mapped: '/mapped/to/file',
  },
};

test('resolved from map', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import '/mapped/to/file'`));
});

test('resolved from absolute', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import '/absolute.js'`));
});

test('resolved from relative', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import '../relative.js'`));
});

test('resolved from sibling', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import './sibling.js'`));
});

test('resolved from indexed', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import '/implied/index.js'`));
});

test('resolved from packaged', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import 'packaged'`));
});

test('resolved from builtin', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import 'builtin'`));
});

test('resolved from suffix (json) - unchanged', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import '../../long/path.json' // unchanged`));
});

test('unresolved - unchanged', async (t) => {
  const resolved = await resolve(source, '/', map);
  t.true(resolved.includes(`import '/implied/unresolved' // unchanged`));
});
