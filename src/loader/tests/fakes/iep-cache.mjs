const cache = {};

export default (key, values) => {
  cache[key] = values;
  return {
    get: mock(() => cache[key]),
    set: mock((...values) => (cache[key] = { ...cache[key], values })),
  };
};
