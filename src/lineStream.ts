import * as fs from 'fs';
import * as byline from 'byline';

class IOError extends Error {
  constructor(err) {
    super(err);
    this.name = this.constructor.name;
  }
}

export function createStream(file) {
  if (!fs.existsSync(file)) {
    throw new IOError(`ENOENT: no such file or directory: ${file}`);
  }
  return byline(fs.createReadStream(file, { encoding: this.encoding }), { keepEmptyLines: true });
}
