import path from 'path';
import cache, { IEP_STR } from 'iep-cache';
import resolver from '../resolver/index.mjs';
import resolveImportMap from '../resolver/resolve-import-map.mjs';

const iepMap = cache('iepMap', { 'iepMap-persistance': 'false' });
const iepSrc = cache('iepSrc', { 'iepSrc-persistance': 'false' });

const extractIEP = (specifier, protocol = '') => {
  const { pathname, searchParams } = new URL(protocol + specifier);
  const ticket = searchParams.get('__iep');
  return [pathname, ticket];
};

export async function resolve(specifier, context, defaultResolve) {
  let ticket;
  if (specifier.includes('__iep=')) {
    [specifier, ticket] = extractIEP(specifier, 'file:///');
  } else if (context.parentURL && context.parentURL.includes('__iep=')) {
    [, ticket] = extractIEP(context.parentURL);
  }

  if (ticket) {
    const iep = await iepMap.get(ticket);
    specifier = resolveImportMap(iep.map, specifier)[0] || specifier;

    const root = process.env.APP_ROOT || process.env.PWD;
    // fill in missing root for import-mapped specifiers of shape '/relative/path'
    if (specifier.startsWith('/') && !specifier.startsWith(root)) {
      specifier = path.resolve(root, specifier.substr(1));
    }
  }

  const { url } = defaultResolve(specifier, context, defaultResolve);

  // propagate ticket state through the dependency tree
  return {
    url: ticket && url.startsWith('file://') ? `${url}?__iep=${ticket}` : url,
  };
}

export async function getSource(url, context, defaultGetSource) {
  if (url.includes('__iep=')) {
    const [pathname, ticket] = extractIEP(url);
    const cacheKey = `${ticket}.${pathname}`;

    const iep = await iepMap.get(ticket);
    const { timestamp, [IEP_STR]: source } = await iepSrc.get(cacheKey);
    if (timestamp > iep.timestamp) {
      return {
        source,
      };
    }
  }
  // Defer to Node.js for all other URLs.
  return defaultGetSource(url, context, defaultGetSource);
}

export async function transformSource(source, context, defaultTransformSource) {
  const { url } = context;
  if (url.includes('__iep=')) {
    const [pathname, ticket] = extractIEP(url);
    const cacheKey = `${ticket}.${pathname}`;

    // take latest source as-is
    const iep = await iepMap.get(ticket);
    const { timestamp } = await iepSrc.get(cacheKey);
    if (timestamp > iep.timestamp) {
      return {
        source,
      };
    }

    source = await resolver(source, pathname, iep.map, url);
    iepSrc.set(cacheKey, { [IEP_STR]: source });

    return {
      source,
    };
  }
  // Defer to Node.js for all other sources.
  return defaultTransformSource(source, context, defaultTransformSource);
}
