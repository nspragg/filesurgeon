/** @interface */
export interface Writer {
  prepend(line: string): Writer;
  append(line: string): Writer;
  set(i: number, line: string): Writer;
  replace(x: string | RegExp, y: string): Writer;
  filter(fn: (str) => boolean): Writer;
  map(fn: (str) => string): Writer;
  delete(n: number): Writer;
  save(file?): void;
  saveAs(file): void;
}
