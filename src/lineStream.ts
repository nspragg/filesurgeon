import * as fs from 'fs';
import * as byline from 'byline';

export function createStream(file) {
  return byline(fs.createReadStream(file, { encoding: this.encoding }), { keepEmptyLines: true });
}
