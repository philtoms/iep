import se from 'serialize-error';
import pubsub from 'iep-pubsub';

const render = (publish) => (
  channel,
  { ticket, serverEntry, buffer, requestId }
) => {
  if (requestId) {
    const specifier = `${serverEntry}${
      serverEntry.includes('?') ? '&' : '?'
    }__iep=${ticket}`;

    return import(specifier)
      .then((app) => {
        publish('render', {
          responseId: requestId,
          buffer: (app.default || app)(buffer),
        });
      })
      .catch((err) => {
        publish('render', {
          responseId: requestId,
          err: JSON.stringify(se.serializeError(err)),
        });
      });
  }
};

export default (process) => {
  const { publish, subscribe } = pubsub(process);
  subscribe('render', render(publish));
};
