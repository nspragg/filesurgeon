# FileSurgeon

[![NPM downloads](https://img.shields.io/npm/dm/filesurgeon.svg?style=flat)](https://npmjs.org/package/filesurgeon)
[![Build Status](https://travis-ci.org/nspragg/filesurgeon.svg)](https://travis-ci.org/nspragg/filesurgeon) ![license](https://img.shields.io/badge/license-MIT-blue.svg) 
![github-issues](https://img.shields.io/github/issues/nspragg/filesurgeon.svg)
![stars](https://img.shields.io/github/stars/nspragg/filesurgeon.svg)
![forks](https://img.shields.io/github/forks/nspragg/filesurgeon.svg)

> Manipulate text files the easy way

## Installation

```
npm install --save filesurgeon
```

## Usage

```js
const Filesurgeon = require("filesurgeon");

await Filesurgeon.create('/tmp/somefile.txt')
  .edit()
  .replace('old', 'new')
  .save();
```

Examples: 

Set lines in a file:
```js
const Filesurgeon = require("filesurgeon");

await Filesurgeon.create('/tmp/somefile.txt')
  .edit()
  .set(1, 'first')
  .set(2, 'second')
  .set(3, 'third')
  .save();
```

Transforms lines:
```js
const Filesurgeon = require("filesurgeon");

await Filesurgeon.create('/tmp/somefile.txt')
  .edit()
  .map((line) => line.trim())
  .map((line) => line.toLowerCase())
  .save();
```

Filter lines:
```js
await Filesurgeon.create('/tmp/somefile.txt')
  .edit()
  .filter((line) => {
    return /^[a-d]/.test(line);
  })
  .save();
```
Consume files:

```js
const Filesurgeon = require("filesurgeon");

const contents =  await Filesurgeon.asArray('/tmp/somefile.txt');
console.log(contents);
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
