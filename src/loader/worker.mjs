import se from 'serialize-error';
import pubsub from 'iep-pubsub';

const render = (publish) => ({ ticket, serverEntry, buffer, requestId }) => {
  if (requestId) {
    const specifier = `${serverEntry}${
      serverEntry.includes('?') ? '&' : '?'
    }__iep=${ticket}`;

    return import(specifier)
      .then((app) => {
        publish(ticket, {
          responseId: requestId,
          buffer: (app.default || app)(buffer),
        });
      })
      .catch((err) => {
        publish(ticket, {
          responseId: requestId,
          err: JSON.stringify(se.serializeError(err)),
        });
      });
  }
};

export default (process, ticket) => {
  const { publish, subscribe } = pubsub(process);
  subscribe(ticket, render(publish));
};
