export default (worker) => {
  return async (req, res, next) => {
    if (req.iep) {
      const { ticket, stage } = req.iep.context;
      try {
        req.body = await worker(ticket, req.body);

        if (next) {
          next();
        } else {
          res.send(req.body);
        }
      } catch (err) {
        next({
          status: 500,
          message: err,
          payload: stage === 'prod' ? '' : err.stack,
        });
      }
    }
  };
};
