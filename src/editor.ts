import { Writer } from './writer';

/** @interface */
export interface Editor extends Writer {
  replace(x: string | RegExp, y: string): Editor;
  filter(fn: (str) => boolean): Editor;
  map(fn: (str) => string): Editor;
  delete(n: number): Editor;
}
