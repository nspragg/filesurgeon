import { assert } from 'chai';
import * as sinon from 'sinon';
import * as File from 'file-js';

import { copy, getAbsolutePath, deleteFile } from './utils';

import { Writer } from '../src/writer';
import * as FileSurgeon from '../index';

const sandbox = sinon.sandbox.create();

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
});
