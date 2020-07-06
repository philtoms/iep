export default (worker) => {
  return async (req, res, next) => {
    if (req.iep) {
      const { ticket } = req.iep.context;
      req.body = await worker(ticket, req.body);
    }
    if (next) {
      next();
    } else {
      res.send(req.body);
    }
  };
};
