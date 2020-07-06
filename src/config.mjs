import path from 'path';
import defaultLog from './utils/local-log';

const rootPath = process.env.PWD;

// default entry point for server-side script
const serverEntry = path.resolve(rootPath, 'src/app/index.js');

// default entry point for client-side script
const clientEntry = path.resolve(rootPath, 'src/index.js');

// default persist file url for iep cache persistance
const cachePersistUrl = path.resolve(rootPath, 'iep-cache');

// default entity persistance
const iepMapPersistance = 'entity';
// const srcMapPersistance = 'key';

export default ({
  iep,
  'iep-cache': cache,
  errors,
  log = defaultLog,
  ...rest
}) => ({
  log,
  iep: {
    clientEntry,
    serverEntry,
    ...iep,
  },
  'iep-cache': {
    'cache-persist-url': cachePersistUrl,
    'iepMap-persistance': iepMapPersistance,
    ...cache,
  },
  errors: {
    PROD_500: 'Sorry, something went wrong.',
    ...errors,
  },
  ...rest,
});
