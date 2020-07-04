import cache from 'iep-cache';

import importer from './importer.mjs';
import renderer from './renderer.mjs';
import proxy from './proxy.mjs';

import stageFilter from './utils/stage-filter.mjs';

export default (config) => {
  const iepMap = cache('iepMap', config['iep-cache']);
  const filter = stageFilter(iepMap, config.stages);

  return {
    filter,
    iepMap,
    render: renderer(config, filter),
    proxy: proxy(config, filter),
    imports: importer(config, filter),
  };
};

import {restart} from './service.mjs'
import config from './config.mjs';

export {restart}
export {config}
