export default (iepMap, stages) => {
  const [index, indexType] =
    Object.entries(stages).find(([, value]) => value === 'head') || [];

  const api = {
    stage: async (req) => {
      const query = req.query || {};
      // is this a staged ticket request?
      const staged = Object.keys(stages).find((stage) => query[stage]);

      if (staged && stages[staged] === 'ticket') {
        const ticket = query[staged];
        const iep = await iepMap.get(ticket);
        if (iep.stage === staged) {
          return {
            iep,
            ticket,
            stage: iep.stage,
          };
        }
      }
      // is there an indexed iep?
      const fallthrough = (req.get('accept') || '').includes('html');
      return (fallthrough && api.index(indexType, req)) || {};
    },

    ticket: async (ticket) => {
      const iep = await iepMap.get(ticket);
      if (iep) {
        return {
          iep,
          ticket,
          stage: iep.stage,
        };
      }
      return {};
    },

    index: async (type = 'head') => {
      // only head supported as yet
      if (indexType === type) {
        const iep = (await iepMap.get(index))[0];
        if (iep) {
          return {
            iep,
            ticket: iep.ticket,
            stage: index,
          };
        }
      }
      return {};
    },
  };

  return api;
};
