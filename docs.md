# FileSurgeon

[![Build Status](https://travis-ci.org/nspragg/filesurgeon.svg)](https://travis-ci.org/nspragg/filesurgeon)
[![Coverage Status](https://coveralls.io/repos/github/nspragg/filesurgeon/badge.svg?branch=master)](https://coveralls.io/github/nspragg/filesurgeon?branch=master)

> Manipulate files the easy way

## Common examples

```js
const FileSurgeon = require("filesurgeon");

FileSurgeon.asStream("myFile")
  .prepend("a new line")
  .append("a new line")
  .replace("x", "y")
  .map(makeSomeChange())
  .run();
```
