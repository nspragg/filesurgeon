// @interface
export interface Writer {
    // tslint:disable-next-line:valid-jsdoc
    /**
     * Prepends a given `line` to a file
     *
     * @method
     * prepend
     * @param {string} line
     * @return Writer
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const contents = FileSurgeon.edit(filename)
     *  .prepend(line)
     *  .save();
     */
    prepend(line: string): Writer
    // tslint:disable-next-line:valid-jsdoc
    /**
     * Appends a given `line` to a file
     *
     * @method
     * append
     * @param {string} line
     * @return Writer
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const contents = FileSurgeon.edit(filename)
     *  .append(line)
     *  .save();
     */
    append(line: string): Writer

    // tslint:disable-next-line:valid-jsdoc
    /**
     * sets a `line` at a given line number `N`
     *
     * @method
     * set
     * @param {string} line
     * @param {number} n
     * @return Writer
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const contents = FileSurgeon.edit(filename)
     *  .set(1, line)
     *  .set(10, anotherline)
     *  .save();
     */
    set(i: number, line: string): Writer

    // tslint:disable-next-line:valid-jsdoc
    /**
     * replaces a given string or regex for every line
     *
     * @method
     * replace
     * @param {string|RegExp} source
     * @param {string} replacement
     * @return Writer
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const contents = FileSurgeon.edit(filename)
     *  .replace('x', 'y')
     *  .replace(/x/, 'y')
     *  .save();
     */
    replace(x: string | RegExp, y: string): Writer

    // tslint:disable-next-line:valid-jsdoc
    /**
     * Filters the file contents using a given function
     *
     * @method
     * set
     * @param {function} fn
     * @return Writer
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const contents = FileSurgeon.edit(filename)
     *  .filter((line) => {
     *      return line.length < 10;
     *  })
     *  .save();
     */
    filter(fn: (string) => boolean): Writer

    // tslint:disable-next-line:valid-jsdoc
    /**
     * Maps each line using a given function
     *
     * @method
     * set
     * @param {function} fn
     * @return Writer
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const contents = FileSurgeon.edit(filename)
     *  .map((line) => {
     *      return line.toLowerCase() < 10;
     *  })
     *  .save();
     */
    map(fn: (string) => string): Writer

    // tslint:disable-next-line:valid-jsdoc
    /**
     * Writes any modifications to the file
     *
     * @method
     * save
     * @param {function} fn
     * @return Writer
     * @example
     * import FileSurgeon from 'FileSurgeon';
     *
     * const contents = FileSurgeon.edit(filename)
     *  .set(1, line)
     *  .filter(fn)
     *  .map(fn)
     *  .save();
     */
    save(): void
}
