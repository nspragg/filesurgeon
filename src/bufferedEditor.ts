import * as path from 'path';
import * as  _ from 'highland';
import * as fs from 'fs';
import { promisify } from 'util';
import { createStream } from './lineStream';
import bind from './bind';
import { Editor } from './editor';

const rename = promisify(fs.rename);
const rm = promisify(fs.unlink);

/** @class */
/** @implements {Editor} */
export class BufferedEditor implements Editor {
  private filename: string;
  private writeBuffer: string[];

  constructor(filename: string) {
    this.filename = filename;
    this.writeBuffer = [];
    bind(this);
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * sets a `line` at a given line number `N`
   *
   * @method
   * set
   * @param {string} line
   * @param {number} n
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .set(1, line)
   *  .set(10, anotherline)
   *  .save();
   */
  set(i: number, line: string): Editor {
    const pos = i - 1;
    if (pos > this.writeBuffer.length) {
      const ext = Array(pos - this.writeBuffer.length).fill('\n');
      this.writeBuffer = this.writeBuffer.concat(ext);
    }
    this.writeBuffer[pos] = `${line}\n`;
    return this;
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Prepends a given `line` to a file
   *
   * @method
   * prepend
   * @param {string} line
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .prepend(line)
   *  .save();
   */
  prepend(line: string): Editor {
    this.writeBuffer.unshift(`${line}\n`);
    return this;
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Appends a given `line` to a file
   *
   * @method
   * append
   * @param {string} line
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .append(line)
   *  .save();
   */
  append(line: string): Editor {
    this.writeBuffer.push(`${line}\n`);
    return this;
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * replaces a given string or regex for every line
   *
   * @method
   * replace
   * @param {string|RegExp} source
   * @param {string} replacement
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .replace('x', 'y')
   *  .replace(/x/, 'y')
   *  .save();
   */
  replace(x: string, y: string): Editor {
    this.writeBuffer = this.writeBuffer.map((line) => {
      return line.replace(x, y);
    });
    return this;
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Maps each line using a given function
   *
   * @method
   * map
   * @param {function} fn
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .map((line) => {
   *      return line.toLowerCase() < 10;
   *  })
   *  .save();
   */
  map(fn: (str: any) => string): Editor {
    this.writeBuffer = this.writeBuffer.map(fn);
    return this;
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Filters the file contents using a given function
   *
   * @method
   * filter
   * @param {function} fn
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .filter((line) => {
   *      return line.length < 10;
   *  })
   *  .save();
   */
  filter(fn: (str: any) => boolean): Editor {
    this.writeBuffer = this.writeBuffer.filter(fn);
    return this;
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Deletes line by line number
   *
   * @method
   * delete
   * @param {function} fn
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .delete(10)
   *  .save(); // delete line 10
   */
  delete(n: number): Editor {
    const pos = n - 1;
    this.writeBuffer.splice(pos, 1);
    return this;
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Writes any modifications to the file
   *
   * @method
   * save
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .set(1, line)
   *  .filter(fn)
   *  .map(fn)
   *  .save();
   */
  async save(): Promise<any> {
    let tmp;
    try {
      tmp = this.getTempFile();

      process.setMaxListeners(0);
      process.on('SIGINT', () => {
        this.deleteTmpFile(tmp);
        process.exit(1);
      });

      await this.internalSave(tmp);
      await rename(tmp, this.filename);

    } finally {
      this.deleteTmpFile(tmp);
    }
  }

  private async internalSave(file): Promise<any> {
    let source;
    let dest;

    try {
      source = this.createSourceStream();
      dest = fs.createWriteStream(file);
      await this.modify(dest);

    } finally {
      return new Promise((resolve, reject) => {
        dest.on('close', resolve);
        dest.on('error', reject);
        dest.destroy();
        source.destroy();
      });
    }
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Writes any modifications to a given file
   *
   * @method
   * saveAs
   * @param {string} filename
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .set(1, line)
   *  .filter(fn)
   *  .map(fn)
   *  .saveAs('myFile');
   */
  async saveAs(file): Promise<any> {
    return this.internalSave(file);
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Writes changes to stdout without modifying the source file. Useful for testing changes. 
   *
   * @method
   * preview
   * @return Editor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.edit(filename)
   *  .set(1, line)
   *  .filter(fn)
   *  .map(fn)
   *  .preview(); // writes changes to stdout
   */
  async preview(): Promise<void> {
    let source;
    const dest = process.stdout;

    try {
      source = this.createSourceStream();
      await this.modify(dest);

    } finally {
      source.destroy();
    }
  }

  private deleteTmpFile(tmp) {
    if (fs.existsSync(tmp)) {
      rm(tmp);
    }
  }

  private getTempFile() {
    const name = 'tmp_' +
      process.pid + '_' +
      Math.random()
        .toString(36)
        .substring(5);

    return path.join(path.dirname(this.filename), name);
  }

  private createSourceStream() {
    const source = createStream(this.filename);
    return source;
  }

  private async modify(destination) {
    return new Promise((resolve) => {
      if (this.writeBuffer.length === 0) resolve();

      _(this.writeBuffer).pipe(destination);
      destination.on('finish', () => {
        resolve();
      });
    });
  }
}
