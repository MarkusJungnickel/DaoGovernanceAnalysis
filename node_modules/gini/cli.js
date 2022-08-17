#!/usr/bin/env node

"use strict";

var gini = require("./");
var pkg = require("./package.json");
var args = process.argv.slice(2);

if (args.length <= 0 || args.indexOf("--help") >= 0 || args.indexOf("-h") >= 0) {
  console.log([
    "",
    pkg.name + " - " + pkg.description,
    "",
    "Usage:",
    "",
    "  " + pkg.name + " <1> <2> <3> ... <N>"
  ].join("\n"));
  process.exit();
}

if (args.indexOf("--version") >= 0 || args.indexOf("-v") >= 0) {
  console.log(pkg.version);
  process.exit();
}

console.log(gini.unordered(args));
