import path from 'path';

export default (pathname, root) => {
  if (pathname.startsWith('/')) pathname = pathname.substr(1);
  return path.resolve(root, pathname);
};
