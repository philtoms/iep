// reduce specifier down to single token for import map test
// - scope resolution support still forthcoming
export default (map, specifier) => {
  const token = specifier
    .replace(/(\/index)?\.m?js$/, '')
    .split('/')
    .pop();

  return [map.imports && (map.imports[token] || map.imports[specifier]), token];
};
