# gini [![NPM version](http://img.shields.io/npm/v/gini.svg?style=flat-square)](https://www.npmjs.org/package/gini) [![Build status](http://img.shields.io/travis/dstil/gini.svg?style=flat-square)](https://travis-ci.org/dstil/gini)

Calculate the [Gini coefficient](http://en.wikipedia.org/wiki/Gini_coefficient) of a data set.

## Installation

Install the package with NPM:

```bash
$ npm install -g gini
```

The `-g` flag is recommended for easy CLI usage, but completely optional.

## API

For data sets that are already ordered ascendingly, use the faster `ordered` function:

```javascript
var gini = require("gini");
var data = [0, 2, 3, 8, 9, 13, 14, 23, 49, 57];
var result = gini.ordered(data);
console.log(result); // = 0.5415730337078651
```

For data sets that are *not* already ordered ascendingly, use the slower `unordered` function:

```javascript
var gini = require("gini");
var data = [0, 14, 2, 9, 3, 8, 13, 23, 57, 49];
var result = gini.unordered(data);
console.log(result); // = 0.5415730337078651
```

See [here](http://mathworld.wolfram.com/GiniCoefficient.html) for more information about the two different methods of calculation.

## CLI

Run `gini` from the command line, with a list of numbers provided as input arguments:

```bash
$ gini 0 14 2 9 3 8 13 23 57 49
```
