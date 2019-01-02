import { assert } from 'chai';
import { getAbsolutePath } from './utils';
import * as FileSurgeon from '../index';

describe('FileSurgeon', () => {
  describe('.asString', () => {
    it('returns file contents as a string', async () => {
      const str = await FileSurgeon.asString(getAbsolutePath('small.txt'));
      assert.equal(str, 'this is line 1\nthis is line 2\n');
    });
  });

  describe('.asArray', () => {
    it('returns file contents as an array', async () => {
      const arr = await FileSurgeon.asArray(getAbsolutePath('small.txt'));
      assert.deepEqual(arr, ['this is line 1', 'this is line 2']);
    });
  });

  describe('.concat', () => {
    it('returns concatenated file contents', async () => {
      const arr = await FileSurgeon.concat(
        getAbsolutePath('small.txt'),
        getAbsolutePath('small.txt'));

      assert.deepEqual(arr, [
        'this is line 1',
        'this is line 2',
        'this is line 1',
        'this is line 2']);
    });
  });

  describe('getLines', () => {
    it('gets line n from a given file', async () => {
      const lines = await FileSurgeon.getLines(getAbsolutePath('input.txt'), 1);

      const expected = await FileSurgeon.asArray(getAbsolutePath('input.txt'));
      assert.deepEqual(lines, expected.slice(0, 1));
    });

    it('gets multiple lines from a given file', async () => {
      const lines = await FileSurgeon.getLines(getAbsolutePath('input.txt'), 1, 5, 10);

      assert.deepEqual(lines, [
        'The following are the graphical (non-control) characters defined by',
        'file.',
        '21  EXCLAMATION MARK            A1  INVERTED EXCLAMATION MARK'
      ]);
    });

    it('return an empty array when line is zero', async () => {
      const lines = await FileSurgeon.getLines(getAbsolutePath('input.txt'));
      assert.deepEqual(lines, []);
    });

    it('throws when the file does not exist', async () => {
      try {
        await FileSurgeon.getLines(getAbsolutePath('bad.txt'));
      } catch (err) {
        assert.ok(err);
        assert.include(err.message, 'ENOENT: no such file or directory:');
        return;
      }
      assert.fail('Expected to throw');
    });
  });
});
