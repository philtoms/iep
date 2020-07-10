import path from 'path';
import { init, parse } from 'es-module-lexer/dist/lexer';

import fsPath from './fs-path.mjs';
import resolveFile from './resolve-filepath.mjs';
import resolveImportMap from './resolve-import-map.mjs';

const srcDir = process.env.SRC || process.cwd() + '/src';

// normalise the resolved specifier by replacing the original path
const normalize = (filepath, specifier, token) =>
  `${specifier.split(token)[0]}${token}${filepath.split(token).pop()}`;

export default async (source, pathname, map, baseDir = srcDir) => {
  await init;
  const [imports] = parse(source);
  const dir = path.parse(pathname).dir;
  return imports.reverse().reduce((acc, { s, e, d }) => {
    if (d !== -1) return acc;
    const specifier = acc.substring(s, e);

    let [resolved, token] = resolveImportMap(map, specifier);

    if (!resolved) {
      if (specifier.startsWith('.') || specifier.startsWith('/')) {
        // TODO - review if this absolute path step is required??
        const filepath = fsPath(
          specifier,
          specifier.startsWith('/') ? baseDir : dir
        );

        resolved = resolveFile(filepath, specifier);

        if (resolved) {
          resolved = normalize(resolved, specifier, token);
        }
      }
    }
    return resolved && resolved !== specifier
      ? acc.substr(0, s) + resolved + acc.substr(e)
      : acc;
  }, source);
};

export { resolveImportMap };
