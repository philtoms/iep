import worker from './worker.mjs';

const args = (process.argv || []).reduce((acc, arg) => {
  const [name, value] = arg.split('=');
  return { ...acc, [name.replace('--', '')]: value };
}, {});

worker(process, args.ticket);
