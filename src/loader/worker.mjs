import se from 'serialize-error';

export default (pubsub) => {
  pubsub.on('message', (message) => {
    const { ticket, serverEntry, buffer, requestId } = message;
    if (requestId) {
      const specifier = `${serverEntry}${
        serverEntry.includes('?') ? '&' : '?'
      }__iep=${ticket}`;
      return import(specifier)
        .then((app) => {
          pubsub.send({
            responseId: requestId,
            buffer: (app.default || app)(buffer),
          });
        })
        .catch((err) => {
          pubsub.send({
            responseId: requestId,
            err: JSON.stringify(se.serializeError(err)),
          });
        });
    }
  });
};
