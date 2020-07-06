import { existsSync, statSync } from 'fs';

export default (filepath) => {
  filepath = filepath.replace(/\/$/, '');
  return existsSync(filepath) && statSync(filepath).isFile()
    ? filepath
    : existsSync(filepath + '.js')
    ? filepath + '.js'
    : existsSync(filepath + '.mjs')
    ? filepath + '.mjs'
    : existsSync(filepath + '/index.js')
    ? filepath + '/index.js'
    : existsSync(filepath + '/index.mjs')
    ? filepath + '/index.mjs'
    : undefined;
};
