import * as path from 'path';
import * as  _ from 'highland';
import * as fs from 'fs';
import { promisify } from 'util';
import { createStream } from './lineStream';
import bind from './bind';
import { Editor } from './Editor';

const rename = promisify(fs.rename);
const rm = promisify(fs.unlink);

function toLine(obj) {
  return obj.data + '\n';
}

function toObject() {
  let count = 0;
  return (line) => {
    return {
      data: line.toString(),
      // tslint:disable-next-line:no-increment-decrement
      num: ++count
    };
  };
}

function reset() {
  let count = 0;
  return _.map((line) => {
    // tslint:disable-next-line:no-increment-decrement
    line.num = ++count;
    return line;
  });
}

function setline(lineNumber, to) {
  return _.map((line) => {
    if (line.num === lineNumber) {
      line.data = to;
    }
    return line;
  });
}

function map(fn) {
  return _.map((line) => {
    line.data = fn(line.data);
    return line;
  });
}

function filter(fn) {
  return _.filter((line) => {
    return fn(line.data);
  });
}

function deleteLine(n) {
  return _.filter((line) => {
    return line.num !== n;
  });
}

function replace(from, to) {
  return _.map((line) => {
    line.data = line.data.replace(from, to);
    return line;
  });
}

/** @class */
/** @implements {Editor} */
export class StreamEditor implements Editor {
  private filename: string;
  private _prepend: string[];
  private _append: string[];
  private transforms: any[];

  constructor(filename: string, encoding = 'utf8') {
    this.filename = filename;
    this._prepend = [];
    this._append = [];
    this.transforms = [];
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
    this.transforms.push(setline(i, line));
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
    this._prepend.push(line);
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
    this._append.push(`${line}\n`);
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
    this.transforms.push(replace(x, y));
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
    this.transforms.push(map(fn));
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
    this.transforms.push(filter(fn));
    this.transforms.push(reset());
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
    this.transforms.push(deleteLine(n));
    this.transforms.push(reset());
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
      await this.modify(source, dest);

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
      await this.modify(source, dest);

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

  private createPipeline() {
    const transforms = [
      _.map(toObject()),
      ...this.transforms,
      _.map(toLine)
    ];
    this.transforms = [];
    return _.pipeline(...transforms);
  }

  private createSourceStream() {
    const source = createStream(this.filename);
    return source;
  }

  private consume(source): Promise<any> {
    let dest = _();
    let count = 0;
    let last;

    return new Promise((resolve, reject) => {
      source.on('readable', () => {
        let line;
        // tslint:disable-next-line:no-conditional-assignment
        while (null !== (line = source.read())) {
          if (line instanceof Buffer) {
            line = line.toString('utf8');
          }
          last = line;
          // tslint:disable-next-line:no-increment-decrement
          count++;
          dest.write(line);
        }
      });

      source.on('error', (err) => {
        reject(err);
      });

      source.on('end', () => {
        dest.end();
        if (last === '') { // remove extra blank line
          dest = _(dest).take(count - 1);
        }
        resolve({
          contents: dest,
          length: count
        });
      });
    });
  }

  private async modify(source, destination) {
    const { contents, length } = await this.consume(source);
    return new Promise((resolve) => {
      if (length > 0) {
        _(this._prepend)
          .concat(contents)
          .pipe(this.createPipeline())
          .concat(_(this._append))
          .pipe(destination);
      } else if (this._append.length > 0 || this._prepend.length > 0) {
        _(this._prepend.concat(this._append))
          .pipe(destination);
      } else {
        resolve();
      }

      destination.on('finish', () => {
        resolve();
      });
    });
  }
}
