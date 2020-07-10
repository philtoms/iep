import test from 'ava';

const fake = (exp, isFile = true) => {
  const existsSync = `export const existsSync = response => response==='${exp}'`;
  const statSync = `export const statSync = () => ({isFile: ()=>${isFile}})`;

  return import(`fs?__fake=${existsSync};${statSync}`)
    .then(() => import('../resolve-filepath?__fake=reload'))
    .then((module) => module.default);
};

test.serial('resolved from implied index.js', async (t) => {
  const resolve = await fake('/index.js');
  t.is(resolve('/'), '/index.js');
});

test.serial('resolved from implied index.mjs', async (t) => {
  const resolve = await fake('/index.mjs');
  t.is(resolve('/'), '/index.mjs');
});

test.serial('resolved implied js from path', async (t) => {
  const resolve = await fake('/path.js');
  t.is(resolve('/path'), '/path.js');
});

test.serial('resolved implied mjs from path', async (t) => {
  const resolve = await fake('/path.mjs');
  t.is(resolve('/path'), '/path.mjs');
});

test.serial('resolved from path.suffix', async (t) => {
  const resolve = await fake('/path.suffix');
  t.is(resolve('/path.suffix'), '/path.suffix');
});

test.serial('folder not resolved', async (t) => {
  const resolve = await fake('/folder', false);
  t.is(resolve('/folder'), undefined);
});
