export const existsSync = (response) =>
  response.includes('implied')
    ? response.endsWith('implied/index.js')
    : response.endsWith('json') || response.endsWith('js');

export const statSync = () => ({ isFile: () => true });
export default { existsSync };
