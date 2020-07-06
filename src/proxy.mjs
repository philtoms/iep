import httpProxy from 'http-proxy';

export default (config, filter) => {
  const {
    log,
    iep: { proxy: options },
    errors,
  } = config;

  const proxy1 = httpProxy.createProxyServer({
    ...options,
    selfHandleResponse: true,
  });

  const proxy2 = httpProxy.createProxyServer({
    ...options,
  });

  proxy1.on('proxyRes', (proxyRes, req, res) => {
    const buffer = [];
    proxyRes.on('data', function (chunk) {
      buffer.push(chunk);
    });
    proxyRes.on('end', function () {
      req.body = Buffer.concat(buffer).toString();
      const { ticket, stage, next } = req.iep.context;
      // transfer ticket to cookie so that it can be retrieved for
      // all script requests.
      res.cookie('iep', `${stage}=${ticket}`, {
        maxAge: 60000,
        SameSite: 'None',
      });
      return next();
    });
  });

  return async (req, res, next) => {
    const {
      headers: { referer },
    } = req;
    try {
      // split page requests into [first (ticket available), ...rest]
      const { ticket, stage } = await filter.stage(req, !referer);

      if (ticket) {
        req.iep = {
          ...req.iep,
          context: {
            ticket,
            stage,
            next,
          },
        };

        return proxy1.web(req, res, options.target);
      }

      return proxy2.web(req, res, options.target);
    } catch (err) {
      if (err.message !== '500') log.error('iep:proxy', err);
      res.status(500).send(errors.PROD_500);
    }
  };
};
