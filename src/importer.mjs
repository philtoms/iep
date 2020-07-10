import fs from 'fs';
import { dirname } from 'path';
import { IEP_STR } from 'iep-cache';
import resolver from './resolver/index.mjs';
import cookies from './cookies.mjs';

export default ({ iep: { clientEntry } }, filter, iepSrc) => {
  const srcPath = dirname(clientEntry);
  const parseCookies = cookies();

  return async (req, res, next) => {
    try {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');

      const pathname = `${srcPath}/${req.params[0]}`;

      const { ticket } = parseCookies(req);
      const { iep } = await filter.ticket(ticket);

      const cacheKey = `${ticket}.${pathname}`;
      const cached = await iepSrc.get(cacheKey);

      if (cached.timestamp > iep.timestamp) {
        return res.send(cached[IEP_STR]);
      }

      const source = fs.readFileSync(pathname, 'utf8');
      resolver(source, pathname, iep.map).then((source) => {
        res.send(source);
        iepSrc.set(cacheKey, { [IEP_STR]: source });
      });
    } catch (err) {
      err.message = `iep:import-map - ${err.message}`;
      next(err);
    }
  };
};
