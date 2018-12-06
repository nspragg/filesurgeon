# FileSurgeon

[![NPM downloads](https://img.shields.io/npm/dm/filesurgeon.svg?style=flat)](https://npmjs.org/package/filesurgeon)
[![Build Status](https://travis-ci.org/nspragg/filesurgeon.svg)](https://travis-ci.org/nspragg/filesurgeon) 
<!-- [![Coverage Status](https://coveralls.io/repos/github/nspragg/filesurgeon/badge.svg?branch=master)](https://coveralls.io/github/nspragg/filesurgeon?branch=master) -->
![license](https://img.shields.io/badge/license-MIT-blue.svg) 
![github-issues](https://img.shields.io/github/issues/nspragg/filesurgeon.svg)
![stars](https://img.shields.io/github/stars/nspragg/filesurgeon.svg)
![forks](https://img.shields.io/github/forks/nspragg/filesurgeon.svg)

> Manipulate text files the easy way

## Installation

```
npm install --save filesurgeon
```

## Usage

The example below performs multiple operations on a file:

```js
const Filesurgeon = require("filesurgeon");

await Filesurgeon.create('/tmp/somefile.txt')
  .edit()
  .set(1, 'first')
  .filter((line) => {
    return /^[a-d]/.test(line);
  })
  .replace('old', 'new')
  .map((line) => {
    return line.trim();
  })
  .append('last')
  .save(); // commit to file
```

## Documentation

For more examples and API details, see
[API documentation](https://nspragg.github.io/filesurgeon/)

## Test

```
npm test
```

To generate a test coverage report:

```
npm run coverage
```
