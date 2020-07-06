import importer from './importer';
import renderer from './renderer';
import proxy from './proxy';
import loader, { restart } from './loader';
import config from './config';
import stageFilter from './stage-filter';

export default (config) => {
  const [iepMap, iepSrc, worker] = loader(config);
  const filter = stageFilter(iepMap, config.stages);

  return {
    filter,
    iepMap,
    render: renderer(worker, filter),
    proxy: proxy(config, filter),
    imports: importer(config, filter, iepSrc),
  };
};

export { restart };
export { config };
