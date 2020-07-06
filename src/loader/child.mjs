import se from 'serialize-error';

process.on('message', ({ ticket, serverEntry, buffer, requestId }) => {
  if (requestId) {
    import(`${serverEntry}?__iep=${ticket}`)
      .then((app) =>
        process.send({
          responseId: requestId,
          buffer: (app.default || app)(buffer),
        })
      )
      .catch((err) => {
        process.send({
          responseId: requestId,
          err: JSON.stringify(se.serializeError(err)),
        });
      });
  }
});
