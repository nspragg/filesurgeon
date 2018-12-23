/** @interface */
export interface Writer {
  save(file?): void;
  saveAs(file): void;
}
