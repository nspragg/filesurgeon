import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';
import { createStream } from './lineStream';

const rm = promisify(fs.unlink);
const rename = promisify(fs.rename);

function deleteTmpFile(tmp) {
  if (fs.existsSync(tmp)) {
    rm(tmp);
  }
}

function getTempFile(filename) {
  const name = `tmp_${process.pid}_${Math.random()
    .toString(36)
    .substring(5)}`;

  return path.join(path.dirname(filename), name);
}

export async function overwrite(fn, filename): Promise<any> {
  let tmp;
  try {
    tmp = getTempFile(filename);

    process.setMaxListeners(0);
    process.on('SIGINT', () => {
      deleteTmpFile(tmp);
      process.exit(1);
    });

    await save(filename, tmp, fn);
    await rename(tmp, filename);

  } finally {
    deleteTmpFile(tmp);
  }
}

export async function save(sourceFile, destinationFile, modify): Promise<any> {
  let source;
  let destination;
  let error;
  try {
    try {
      source = createStream(sourceFile);
      destination = fs.createWriteStream(destinationFile);
    } catch (e) {
      error = e;
      throw error;
    }
    await modify(destination, source);

  } finally {
    return new Promise((resolve, reject) => {
      if (error) {
        reject(error);
      }
      if (destination) {
        destination.on('close', resolve);
        destination.on('error', reject);
        destination.destroy();
      }
      if (source) {
        source.destroy();
      }
    });
  }
}
