import * as path from 'path';
import * as  _ from 'highland';
import * as fs from 'fs';
import * as File from 'file-js';
import { Writer } from './writer';
import { promisify } from 'util';
import { createStream } from './lineStream';
import bind from './bind';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
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
            num: ++count
        }
    };
}

function reset() {
    let count = 0;
    return _.map((line) => {
        line.num = ++count;
        return line;
    });
}

function setline(lineNumber, to) {
    return _.map((line) => {
        if (line.num == lineNumber) {
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
        return line.num != n;
    });
}

function replace(from, to) {
    return _.map((line) => {
        line.data = line.data.replace(from, to);
        return line;
    });
}

export class StreamWriter implements Writer {
    private filename: string;
    private encoding: string;
    private _prepend: string[];
    private _append: string[];
    private transforms: any[];

    constructor(filename: string, encoding = 'utf8') {
        this.filename = filename;
        this.encoding = encoding;
        this._prepend = [];
        this._append = [];
        this.transforms = [];
        bind(this);
    }

    set(i: number, line: string): Writer {
        this.transforms.push(setline(i, line));
        return this;
    }

    prepend(line: string): Writer {
        this._prepend.push(line);
        return this;
    }

    append(line: string): Writer {
        this._append.push(`${line}\n`);
        return this;
    }

    replace(x: string, y: string): Writer {
        this.transforms.push(replace(x, y));
        return this;
    }

    map(fn: (string: any) => string): Writer {
        this.transforms.push(map(fn));
        return this;
    }

    filter(fn: (string: any) => boolean): Writer {
        this.transforms.push(filter(fn));
        this.transforms.push(reset());
        return this;
    }

    delete(n: number): Writer {
        this.transforms.push(deleteLine(n));
        this.transforms.push(reset());
        return this;
    }

    async save(): Promise<void> {
        let tmp;
        let source;
        let dest;

        try {
            source = this.createSourceStream();
            tmp = this.getTempFile();
            dest = fs.createWriteStream(tmp);

            await this.modify(source, dest);
            await rename(tmp, this.filename);

        } finally {
            dest.destroy();
            source.destroy();
            if (fs.existsSync(tmp)) {
                rm(tmp);
            }
        }
    }

    async preview(dest): Promise<void> {
        let source;
        dest = dest || process.stdout;

        try {
            source = this.createSourceStream();
            await this.modify(source, dest);

        } finally {
            dest.destroy();
            source.destroy();
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
        let transforms = [
            _.map(toObject()),
            ...this.transforms,
            _.map(toLine)
        ]
        this.transforms = [];
        return _.pipeline(...transforms);
    }

    private getLines() {
        return _(this._append);
    }

    private createSourceStream() {
        const source = createStream(this.filename);
        return source;
    }

    private consume(source): Promise<any> {
        const dest = _();
        let count = 0;
        let last;

        return new Promise((resolve) => {
            source.on('readable', () => {
                let line;
                while (null !== (line = source.read())) {
                    if (line instanceof Buffer) {
                        line = line.toString('utf8');
                    }
                    last = line;
                    count++;
                    dest.write(line);
                }
            });

            source.on('end', () => {
                dest.end();
                if (last === '') { // remove extra blank line
                    resolve(_(dest).take(count - 1));
                }
            });
        });
    }

    private async modify(source, destination) {
        let contents;
        try {
            contents = await this.consume(source);

            return new Promise((resolve) => {
                _(this._prepend)
                    .concat(contents)
                    .pipe(this.createPipeline())
                    .concat(this.getLines())
                    .pipe(destination);

                destination.on('finish', () => {
                    resolve();
                });
            });
        } finally {
            contents.destroy();
        }
    }
}
