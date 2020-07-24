import path from 'path';

const rootPath = process.env.PWD;

// default entry point for server-side script
const serverEntry = path.resolve(rootPath, 'src/app/index.js');

// default entry point for client-side script
const clientEntry = path.resolve(rootPath, 'src/index.js');

// default persist file url for iep cache persistance
const cachePersistUrl = path.resolve(rootPath, 'iep-cache');

// default entity persistance
const iepMapPersistance = 'entity';
const iepSrcPersistance = false;

export default ({ iep, 'iep-cache': cache, ...rest }) => ({
  iep: {
    clientEntry,
    serverEntry,
    ...iep,
  },
  'iep-cache': {
    '--cache-persist-url': cachePersistUrl,
    '--iepMap-persistance': iepMapPersistance,
    '--iepSrc-persistance': iepSrcPersistance,
    '--cache-entity-key': 'source',
    ...cache,
  },
  ...rest,
});
