import { assert } from 'chai';
import * as path from 'path';
import * as FileSurgeon from '../index';
import * as File from 'file-js';
import { copy, getAbsolutePath, deleteFile } from './utils';

const fixture = 'input.txt';

describe('Stream', () => {
  describe('.prepend', () => {
    let file;
    beforeEach(() => {
      const source = getAbsolutePath(fixture);
      file = getAbsolutePath(fixture + '_tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('inserts a line at the beginning of the file', async () => {
      await FileSurgeon.create(file)
        .edit()
        .prepend('prepended line1')
        .prepend('prepended line2')
        .prepend('prepended line3')
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('prepend.txt'));

      assert.deepEqual(arr, expected);
    });
  });

  describe('.append', () => {
    let file;
    beforeEach(() => {
      const source = getAbsolutePath(fixture);
      file = getAbsolutePath(fixture + '_tmp1');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('appends a line at the end of the file', async () => {
      await FileSurgeon.create(file)
        .edit()
        .append('appended line1')
        .append('appended line2')
        .append('appended line3')
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('append.txt'));
      assert.deepEqual(arr, expected);
    });
  });

  describe('.set', () => {
    let file;
    beforeEach(() => {
      const source = getAbsolutePath(fixture);
      file = getAbsolutePath(fixture + '_tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('over writes an existing lines', async () => {
      await FileSurgeon.create(file)
        .edit()
        .set(1, 'NEW1')
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('set.txt'));
      assert.deepEqual(arr, expected);
    });

    it('chains multiple calls', async () => {
      await FileSurgeon.create(file)
        .edit()
        .set(1, 'NEW1')
        .set(2, 'NEW2')
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('multi-set.txt'));
      assert.deepEqual(arr, expected);
    });
  });

  describe('.map', () => {
    let file;
    beforeEach(() => {
      const source = getAbsolutePath('small.txt');
      file = getAbsolutePath(fixture + '_tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('maps each line using a given fn', async () => {
      await FileSurgeon.create(file)
        .edit()
        .map((line) => {
          return line.toUpperCase();
        })
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('map.txt'));
      assert.deepEqual(arr, expected);
    });

    it('chains multiple calls', async () => {
      await FileSurgeon.create(file)
        .edit()
        .map((line) => {
          return line.toUpperCase();
        })
        .map((line) => {
          return 'PREFIX:' + line.toUpperCase();
        })
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('multi-map.txt'));
      assert.deepEqual(arr, expected);
    });
  });

  describe('.filter', () => {
    let file;
    beforeEach(() => {
      const source = getAbsolutePath('input.txt');
      file = getAbsolutePath(fixture + '_tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('applies a given filter', async () => {
      await FileSurgeon.create(file)
        .edit()
        .filter((line) => {
          return /CAPITAL/.test(line);
        })
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('filtered-edit.txt'));
      assert.deepEqual(arr, expected);
    });

    it('resets line count after filter', async () => {
      await FileSurgeon.create(file)
        .edit()
        .filter((line) => {
          return /DIGIT/.test(line);
        })
        .set(1, 'filter reset')
        .set(3, 'filter reset')
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('filtered-reset.txt'));
      assert.deepEqual(arr, expected);
    });
  });

  describe('.replace', () => {
    let file;
    let source;
    beforeEach(() => {
      source = getAbsolutePath('input.txt');
      file = getAbsolutePath(fixture + '_tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('replaces 1st instance of x with y', async () => {
      await FileSurgeon.create(file)
        .edit()
        .replace('TWO', '2')
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('replace.txt'));
      assert.deepEqual(arr, expected);
    });

    it('replaces all instances of x with y using a regex', async () => {
      await FileSurgeon.create(file)
        .edit()
        .replace(new RegExp('TWO', 'g'), '2')
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('replace-all.txt'));
      assert.deepEqual(arr, expected);
    });

    it('chains multiple calls', async () => {
      await FileSurgeon.create(file)
        .edit()
        .replace(new RegExp('TWO', 'g'), '2')
        .replace('B2', '**')
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('multi-replace.txt'));
      assert.deepEqual(arr, expected);
    });
  });

  describe('multiple edits', () => {
    let file;
    beforeEach(() => {
      const source = getAbsolutePath('input.txt');
      file = getAbsolutePath(fixture + '_tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('performs multiple edits', async () => {
      await FileSurgeon.create(file)
        .edit()
        .set(1, 'line1')
        .set(2, 'line2')
        .replace(/SMALL/g, 'LARGE')
        .map((line) => {
          return line.toLowerCase();
        })
        .filter((line) => {
          return !/CAPITAL/i.test(line);
        })
        .save();

      const actual = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('multi-edit.txt'));
      assert.deepEqual(actual, expected);
    });
  });

  describe('.save', () => {
    let file;
    beforeEach(() => {
      const source = getAbsolutePath('input.txt');
      file = getAbsolutePath(fixture + '_tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('cleans up temp resources on error', async () => {
      try {
        await FileSurgeon.create(file)
          .edit()
          .filter(() => {
            throw new Error('bad news');
          })
          .save();
      } catch (err) {
        const count = File.create(path.join(__dirname + '/fixtures/'))
          .getFilesSync('tmp_*');
        assert.equal(count.length, 0, 'temp files remaining');
      }
    });
  });

  describe('.saveAs', () => {
    let file;
    let dest;
    beforeEach(() => {
      const source = getAbsolutePath('input.txt');
      file = getAbsolutePath(fixture + '_tmp');
      dest = getAbsolutePath('save-as-tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
      deleteFile(dest);
    });

    it('saves changes to a specified file', async () => {

      await FileSurgeon.create(file)
        .edit()
        .replace('TWO', '2')
        .saveAs(dest);

      const arr = await FileSurgeon.asArray(dest);
      const expected = await FileSurgeon.asArray(getAbsolutePath('replace.txt'));
      assert.deepEqual(arr, expected);
    });
  });

  describe('.delete', () => {
    let file;
    beforeEach(() => {
      const source = getAbsolutePath(fixture);
      file = getAbsolutePath(fixture + '_tmp');
      copy(source, file);
    });

    afterEach(() => {
      deleteFile(file);
    });

    it('delete a line specified by lie number', async () => {
      await FileSurgeon.create(file)
        .edit()
        .delete(10)
        .delete(20)
        .save();

      const arr = await FileSurgeon.asArray(file);
      const expected = await FileSurgeon.asArray(getAbsolutePath('delete.txt'));

      assert.deepEqual(arr, expected);
    });
  });

});
