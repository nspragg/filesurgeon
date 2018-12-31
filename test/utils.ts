import * as fs from 'fs';
import * as path from 'path';

export function getAbsolutePath(file: string): string {
  return path.join(`${__dirname}/fixtures/`, file);
}

export function qualifyNames(names: string[]): string[] {
  return names.map(getAbsolutePath);
}

export function deleteFile(file) {
  fs.unlinkSync(file);
}

export function copy(source, destination): void {
  const BUF_LENGTH = 64 * 1024;
  const buff = new Buffer(BUF_LENGTH);
  const fdr = fs.openSync(source, 'r');
  const fdw = fs.openSync(destination, 'w');
  let bytesRead = 1;
  let pos = 0;

  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  fs.closeSync(fdw);
}

export function touchSync(filename) {
  fs.closeSync(fs.openSync(filename, 'w'));
}
