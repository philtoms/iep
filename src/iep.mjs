import processor from './loader/main-process.mjs';
import importer from './importer.mjs';
import renderer from './renderer.mjs';
import proxy from './proxy.mjs';
import stageFilter from './stage-filter.mjs';

export default (config) => {
  const [iepMap, iepSrc, worker] = processor(config);
  const filter = stageFilter(iepMap, config.stages);

  return {
    iepMap,
    filter,
    render: renderer(worker, filter),
    proxy: proxy(config, filter),
    imports: importer(config, filter, iepSrc),
  };
};
