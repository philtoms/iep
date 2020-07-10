import path from 'path';
import { init, parse } from 'es-module-lexer/dist/lexer';

import fsPath from './fs-path.mjs';
import resolveFile from './resolve-filepath.mjs';

const srcDir = process.env.SRC || process.cwd() + '/src';

// normalise the resolved specifier by replacing the original path
const normalize = (filepath, specifier, selector) =>
  `${specifier.split(selector)[0]}${selector}${filepath.split(selector).pop()}`;

export default async (source, pathname, map, baseDir = srcDir) => {
  await init;
  const [imports] = parse(source);
  const dir = path.parse(pathname).dir;
  return imports.reverse().reduce((acc, { s, e, d }) => {
    if (d !== -1) return acc;
    const specifier = acc.substring(s, e);
    // reduce specifier down to single token for import map test
    // - scope resolution support still forthcoming
    const selector = specifier
      .replace(/(\/index)?\.m?js$/, '')
      .split('/')
      .pop();
    let resolved =
      map.imports && (map.imports[specifier] || map.imports[selector]);

    if (!resolved) {
      if (specifier.startsWith('.') || specifier.startsWith('/')) {
        // TODO - review if this absolute path step is required??
        const filepath = fsPath(
          specifier,
          specifier.startsWith('/') ? baseDir : dir
        );

        resolved = resolveFile(filepath, specifier);

        if (resolved) {
          resolved = normalize(resolved, specifier, selector);
        }
      }
    }
    return resolved && resolved !== specifier
      ? acc.substr(0, s) + resolved + acc.substr(e)
      : acc;
  }, source);
};
