import * as  _ from 'highland';
import * as fs from 'fs';
import { promisify } from 'util';
import { StreamWriter } from './streamWriter';
import { Writer } from './writer';
import { createStream } from './lineStream';

const readFileAsync = promisify(fs.readFile);

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
        return arr.map(buffer => buffer.toString())
    }

    // tslint:disable-next-line:valid-jsdoc
    /**
     * Static factory method to an instance of FileSurgeon
     *
     * @static
     * @memberOf FileSurgeon
     * @method
     * create
     * @return FileSurgeon 
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const surgeon = FileSurgeon.create(file);
     */
    static create(filename: string): FileSurgeon {
        return new FileSurgeon(filename);
    }

    // tslint:disable-next-line:valid-jsdoc
    /**
     * Returns an instance of Writer to modify file contents
     *
     * @static
     * @memberOf FileSurgeon
     * @method
     * edit
     * @param {string} filename
     * @return Writer
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const contents = FileSurgeon.edit(filename);
     */
    edit(): Writer {
        return new StreamWriter(this.filename)
    }
}
