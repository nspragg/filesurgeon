# FileSurgeon

[![Build Status](https://travis-ci.org/nspragg/filesurgeon.svg)](https://travis-ci.org/nspragg/filesurgeon)

> Manipulate files the easy way

## Common examples

### Replace text and save changes

Perform replacement using string parameters and regular expressions:

```js
const FileSurgeon = require("filesurgeon");

FileSurgeon.create("myFile")
  .edit()
  .replace("x", "y")
  .replace(/.*y.*/g, "z")
  .save();
```

### Map text and save changes

Convert all lines to lower case using map:

```js
const FileSurgeon = require("filesurgeon");

FileSurgeon.create("myFile")
  .edit()
  .map((line) => {
    return line.toLowerCase();
  })
  .save();
```

### Filter lines and save changes

Filters file to lines start with someText and save changes:

```js
const FileSurgeon = require("filesurgeon");

FileSurgeon.create("myFile")
  .edit()
  .filter((line) => {
    return /^someText/.test(line);
  })
  .save();
```

### Prepends lines to a file

Prepends 'my line1' and 'my line2':

```js
const FileSurgeon = require("filesurgeon");

FileSurgeon.create("myFile")
  .edit()
  .prepend("my line1")
  .prepend("my line2")
  .save();
```

### Appends lines to a file

Appends 'my line1' and 'my line2':

```js
const FileSurgeon = require("filesurgeon");

FileSurgeon.create("myFile")
  .edit()
  .append("my line1")
  .append("my line2")
  .save();
```

### Overwrite lines

Overrwrites (sets) lines 1 and 10:

```js
const FileSurgeon = require("filesurgeon");

FileSurgeon.create("myFile")
  .edit()
  .set(1, "my line1")
  .set(10, "my line2")
  .save();
```

### Delete lines

delete lines 1 and 10:

```js
const FileSurgeon = require("filesurgeon");

FileSurgeon.create("myFile")
  .edit()
  .delete(1)
  .delete(10)
  .save();
```

### Concatenate files

concatenates contents of `file1` and `file2`

```js
const FileSurgeon = require("filesurgeon");

const contents = FileSurgeon.concat(file1, file2);
console.log(contents);
```

### Consuming file contents

read `file` as a string

```js
const FileSurgeon = require("filesurgeon");

const contents = FileSurgeon.asString(file);
console.log(contents);
```

read `file` as an array

```js
const FileSurgeon = require("filesurgeon");

const contents = FileSurgeon.asArray(file);
console.log(contents);
```
