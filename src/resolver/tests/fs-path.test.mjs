import test from 'ava';
import fsPath from '../fs-path';

test('resolved from root and path', (t) => {
  t.is(fsPath('path/to/file', '/root'), '/root/path/to/file');
});

test('absolute path adjusted to root', (t) => {
  t.is(fsPath('/path', '/root'), '/root/path');
});

test('sibling path adjusted to root', (t) => {
  t.is(fsPath('./path', '/root'), '/root/path');
});

test('relative path adjusted to root', (t) => {
  t.is(fsPath('../path', '/root'), '/path');
});

test('implied path adjusted to root', (t) => {
  t.is(fsPath('/', '/root'), '/root');
});

test('implied sibling path adjusted to root', (t) => {
  t.is(fsPath('.', '/root'), '/root');
});
