# FileSurgeon

![npm](https://img.shields.io/npm/v/filesurgeon.svg)
[![Build Status](https://travis-ci.org/nspragg/filesurgeon.svg)](https://travis-ci.org/nspragg/filesurgeon)
[![Coverage Status](https://coveralls.io/repos/github/nspragg/filesurgeon/badge.svg?branch=master)](https://coveralls.io/github/nspragg/filesurgeon?branch=master)
![license](https://img.shields.io/badge/license-MIT-blue.svg)
![github-issues](https://img.shields.io/github/issues/nspragg/filesurgeon.svg)
![stars](https://img.shields.io/github/stars/nspragg/filesurgeon.svg)
![forks](https://img.shields.io/github/forks/nspragg/filesurgeon.svg)

> Manipulate text files the easy way

![nodei.co](https://nodei.co/npm/filesurgeon.png?downloads=true&downloadRank=true&stars=true)

## Installation

```
npm install --save filesurgeon
```

## Usage

The example below overrides the first line and converts each file to lower case:

```js
const Filesurgeon = require("filesurgeon");

const lines = await Filesurgeon.create('/tmp/somefile.txt')
  .edit()
  .set(1, 'line 1')
  .map((line) => {
    return line.toLowerCase();
  })
  .save();

console.log(lines);
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
