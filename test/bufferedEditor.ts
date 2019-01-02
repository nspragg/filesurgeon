import { assert } from 'chai';
import * as FileSurgeon from '../index';
import { getAbsolutePath, deleteFile } from './utils';

describe('BufferedEditor', () => {
  let emptyFile;
  beforeEach(() => {
    emptyFile = getAbsolutePath('_empty_tmp');
  });

  afterEach(() => {
    deleteFile(emptyFile);
  });

  it('saves an empty file', async () => {
    await FileSurgeon.new(emptyFile)
      .save();

    const arr = await FileSurgeon.asArray(emptyFile);
    assert.deepEqual(arr, []);
  });

  describe('.prepend', () => {
    it('inserts a line at the beginning of the file', async () => {
      await FileSurgeon.new(emptyFile)
        .prepend('prepended line1')
        .prepend('prepended line2')
        .prepend('prepended line3')
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, [
        'prepended line3',
        'prepended line2',
        'prepended line1'
      ]);
    });
  });

  describe('.append', () => {
    it('appends a line at the end of a new file', async () => {
      await FileSurgeon.new(emptyFile)
        .append('appended line1')
        .append('appended line2')
        .append('appended line3')
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, [
        'appended line1',
        'appended line2',
        'appended line3'
      ]);
    });
  });

  describe('.set', () => {
    it('Sets a line in a file', async () => {
      await FileSurgeon.new(emptyFile)
        .set(1, 'NEW1')
        .set(2, 'NEW2')
        .set(3, 'NEW3')
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, ['NEW1', 'NEW2', 'NEW3']);
    });

    it('overrides existing lines', async () => {
      await FileSurgeon.new(emptyFile)
        .set(1, 'NEW1')
        .set(2, 'NEW2')
        .set(1, 'NEW2')
        .set(2, 'NEW1')
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, ['NEW2', 'NEW1']);
    });

    it('creates preceding blank lines', async () => {
      await FileSurgeon.new(emptyFile)
        .set(5, 'NEW5')
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, [
        '',
        '',
        '',
        '',
        'NEW5'
      ]);
    });
  });

  describe('.map', () => {
    it('maps each line using a given fn', async () => {
      await FileSurgeon.new(emptyFile)
        .set(1, 'line1')
        .set(2, 'line2')
        .set(3, 'line3')
        .map((line) => {
          return line.toUpperCase();
        })
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, [
        'LINE1',
        'LINE2',
        'LINE3'
      ]);
    });
  });

  describe('.filter', () => {
    it('applies a given filter', async () => {
      await FileSurgeon.new(emptyFile)
        .set(1, 'line1')
        .set(2, 'line2')
        .set(3, 'line3')
        .filter((line) => {
          return /line2/.test(line);
        })
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, ['line2']);
    });
  });

  describe('.replace', () => {
    it('replaces 1st instance of x with y', async () => {
      await FileSurgeon.new(emptyFile)
        .set(1, 'x1')
        .set(2, 'x2')
        .set(3, 'x3')
        .replace('x', 'y')
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, [
        'y1',
        'y2',
        'y3'
      ]);
    });
  });

  describe('chained calls', () => {
    it('performs multiple operations', async () => {
      await FileSurgeon.new(emptyFile)
        .append('line1')
        .set(1, 'override1')
        .set(2, 'line2')
        .append('last')
        .save();

      const actual = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(actual, [
        'override1',
        'line2',
        'last'
      ]);
    });
  });

  describe('.delete', () => {
    it('delete a line specified by line number', async () => {
      await FileSurgeon.new(emptyFile)
        .append('line1')
        .append('line2')
        .append('line3')
        .delete(2)
        .save();

      const arr = await FileSurgeon.asArray(emptyFile);
      assert.deepEqual(arr, [
        'line1',
        'line3'
      ]);
    });
  });
});
