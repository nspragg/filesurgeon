import * as  _ from 'highland';
import * as fs from 'fs';
import { promisify } from 'util';
import { StreamEditor } from './streamEditor';
import { BufferedEditor } from './bufferedEditor';
import { Writer } from './writer';
import { createStream } from './lineStream';

const readFileAsync = promisify(fs.readFile);

export function touchSync(filename) {
  fs.closeSync(fs.openSync(filename, 'w'));
}

/** @class */
export default class FileSurgeon {
  private filename: string;

  constructor(filename) {
    this.filename = filename;
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
  * Static factory method to an array of concatenated file contents
  *
  * @static
  * @memberOf FileSurgeon
  * @method
  * concat
  * @return FileSurgeon Promise<string>
  * @example
  * import FileSurgeon from 'FileSurgeon';
  *
  * const contents = FileSurgeon.concat(file1, file2);
  * console.log(contents);
  */
  // tslint:disable-next-line:prefer-array-literal
  static async concat(filename1: string, filename2: string): Promise<Array<any>> {
    const f1 = await FileSurgeon.asArray(filename1);
    const f2 = await FileSurgeon.asArray(filename2);
    return f1.concat(f2);
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Static factory method to read the contents of a file as a string
   *
   * @static
   * @memberOf FileSurgeon
   * @method
   * asString
   * @return FileSurgeon Promise<string>
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.asString(file);
   */
  static asString(filename: string): Promise<string> {
    return readFileAsync(filename, 'utf8');
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Static factory method to read the contents of a file as an array
   *
   * @static
   * @memberOf FileSurgeon
   * @method
   * asArray
   * @return FileSurgeon Promise<string>
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const contents = FileSurgeon.asArray(file);
   */
  static async asArray(filename: string): Promise<string[]> {
    const source = createStream(filename);
    const arr = await _(source)
      .collect()
      .toPromise(Promise);

    source.destroy();

    if (arr.length > 0 && arr[arr.length - 1].toString() === '') { // remove extra blank line
      arr.pop();
    }
    return arr.map(buffer => buffer.toString());
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * @deprecated since version 1.2.0
   */
  static create(filename: string): FileSurgeon {
    return new FileSurgeon(filename);
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Static factory method to edit existing file contents
   *
   * @static
   * @memberOf FileSurgeon
   * @method
   * edit
   * @return StreamEditor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const surgeon = FileSurgeon.edit(file);
   */
  static edit(filename: string): StreamEditor {
    return new StreamEditor(filename);
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * Static factory method create new files
   *
   * @static
   * @memberOf FileSurgeon
   * @method
   * newFile
   * @return StreamEditor
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const surgeon = FileSurgeon.newFile(file);
   */
  static newFile(filename: string): BufferedEditor {
    touchSync(filename);
    return new BufferedEditor(filename);
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * async static factory method get lines from a given file
   *
   * @static
   * @memberOf FileSurgeon
   * @method
   * getLines
   * @return Promise<String[]>
   * @example
   * import FileSurgeon from 'FileSurgeon';
   *
   * const lines = await FileSurgeon.getLines(file, 1, 5, 10);
   */
  static async getLines(filename: string, ...requiredLines: number[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const source = createStream(filename);
      const lines = [];
      let count = 0;

      source.on('readable', () => {
        let line;
        // tslint:disable-next-line:no-conditional-assignment
        while (null !== (line = source.read())) {
          count = count + 1;
          if (line instanceof Buffer) {
            line = line.toString('utf8');
          }
          if (requiredLines.indexOf(count) !== -1) {
            lines.push(line);
            break;
          }
        }
      });

      source.on('error', (err) => {
        reject(err);
      });

      source.on('end', () => {
        source.destroy();
        resolve(lines);
      });
    });
  }

  // tslint:disable-next-line:valid-jsdoc
  /**
   * @deprecated since version 1.2.0
   */
  edit(): Writer {
    return new StreamEditor(this.filename);
  }
}
