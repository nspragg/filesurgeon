/** @interface */
export interface Writer {
  prepend(line: string): Writer;
  append(line: string): Writer;
  set(i: number, line: string): Writer;
  save(file?): void;
  saveAs(file): void;
}
