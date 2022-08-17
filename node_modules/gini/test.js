"use strict";

var gini = require("./");

describe("ordered()", function() {
  it("should throw an error for non-array data sets", function() {
    (function() { gini.ordered("2,4,7") }).should.throw("Data set is not an array.");
  });

  it("should throw an error for empty array data sets", function() {
    (function() { gini.ordered([]) }).should.throw("Data set is an empty array.");
  });

  it("should throw an error for data sets containing non-numbers", function() {
    (function() { gini.ordered([1, 2, 3]) }).should.not.throw("Data set contains non-numbers.");
    (function() { gini.ordered([1, 2, "3"]) }).should.not.throw("Data set contains non-numbers.");
    (function() { gini.ordered([1, 2, "a"]) }).should.throw("Data set contains non-numbers.");
  });

  it("should throw an error for data sets containing negative numbers", function() {
    (function() { gini.ordered([0, 0, 0]) }).should.not.throw("Data set contains negative numbers.");
    (function() { gini.ordered([0, 1, 2]) }).should.not.throw("Data set contains negative numbers.");
    (function() { gini.ordered([1, 2, 3]) }).should.not.throw("Data set contains negative numbers.");
    (function() { gini.ordered([-1, 0, 1]) }).should.throw("Data set contains negative numbers.");
    (function() { gini.ordered([-2, -1, 0]) }).should.throw("Data set contains negative numbers.");
  });

  it("should throw an error for data sets not ordered ascendingly", function() {
    (function() { gini.ordered([123]) }).should.not.throw("Data set is not ordered ascendingly.");
    (function() { gini.ordered([1, 2, 3]) }).should.not.throw("Data set is not ordered ascendingly.");
    (function() { gini.ordered([1, 2, 2, 3]) }).should.not.throw("Data set is not ordered ascendingly.");
    (function() { gini.ordered([1, 3, 2]) }).should.throw("Data set is not ordered ascendingly.");
    (function() { gini.ordered([1, 2, 3, 2]) }).should.throw("Data set is not ordered ascendingly.");
  });

  it("should correctly calculate gini coefficient of data sets", function() {
    gini.ordered([0]).should.be.a.Number.and.exactly(0);
    gini.ordered([0, 0, 0]).should.be.a.Number.and.exactly(0);
    gini.ordered([1]).should.be.a.Number.and.exactly(0);
    gini.ordered([1, 1, 1]).should.be.a.Number.and.exactly(0);
    gini.ordered([7]).should.be.a.Number.and.exactly(0);
    gini.ordered([7, 7, 7]).should.be.a.Number.and.exactly(0);
    gini.ordered([9.2]).should.be.a.Number.and.exactly(0);
    gini.ordered([9.2, 9.2, 9.2]).should.be.a.Number.and.exactly(0);
    gini.ordered([2.7, 3]).should.be.a.Number.and.approximately(0.026, 0.001);
    gini.ordered([0, 1, 2]).should.be.a.Number.and.approximately(0.444, 0.001);
    gini.ordered([4, 89, 501]).should.be.a.Number.and.approximately(0.558, 0.001);
    gini.ordered([0.54, 3.76, 4.99, 6.9, 62.8]).should.be.a.Number.and.approximately(0.646, 0.001);
    gini.ordered([9.1, 11.8, 20, 43]).should.be.a.Number.and.approximately(0.327, 0.001);
    gini.ordered([10, 12, 59, 81, 86, 89, 93]).should.be.a.Number.and.approximately(0.286, 0.001);
    gini.ordered([3, 5, 1907645172]).should.be.a.Number.and.approximately(0.667, 0.001);
    gini.ordered([2.5, 6, 40, 713, 1002.55, 92827420.5]).should.be.a.Number.and.approximately(0.833, 0.001);
  });
});

describe("unordered()", function() {
  it("should throw an error for non-array data sets", function() {
    (function() { gini.unordered("2,7,4") }).should.throw("Data set is not an array.");
  });

  it("should throw an error for empty array data sets", function() {
    (function() { gini.unordered([]) }).should.throw("Data set is an empty array.");
  });

  it("should throw an error for data sets containing non-numbers", function() {
    (function() { gini.unordered([1, 3, 2]) }).should.not.throw("Data set contains non-numbers.");
    (function() { gini.unordered([1, "3", 2]) }).should.not.throw("Data set contains non-numbers.");
    (function() { gini.unordered([1, "a", 2]) }).should.throw("Data set contains non-numbers.");
  });

  it("should throw an error for data sets containing negative numbers", function() {
    (function() { gini.unordered([0, 0, 0]) }).should.not.throw("Data set contains negative numbers.");
    (function() { gini.unordered([2, 1, 0]) }).should.not.throw("Data set contains negative numbers.");
    (function() { gini.unordered([3, 1, 2]) }).should.not.throw("Data set contains negative numbers.");
    (function() { gini.unordered([1, 0, -1]) }).should.throw("Data set contains negative numbers.");
    (function() { gini.unordered([0, -1, -2]) }).should.throw("Data set contains negative numbers.");
  });

  it("should correctly calculate gini coefficient of data sets", function() {
    gini.unordered([0]).should.be.a.Number.and.exactly(0);
    gini.unordered([0, 0, 0]).should.be.a.Number.and.exactly(0);
    gini.unordered([1]).should.be.a.Number.and.exactly(0);
    gini.unordered([1, 1, 1]).should.be.a.Number.and.exactly(0);
    gini.unordered([7]).should.be.a.Number.and.exactly(0);
    gini.unordered([7, 7, 7]).should.be.a.Number.and.exactly(0);
    gini.unordered([9.2]).should.be.a.Number.and.exactly(0);
    gini.unordered([9.2, 9.2, 9.2]).should.be.a.Number.and.exactly(0);
    gini.unordered([3, 2.7]).should.be.a.Number.and.approximately(0.026, 0.001);
    gini.unordered([0, 2, 1]).should.be.a.Number.and.approximately(0.444, 0.001);
    gini.unordered([501, 4, 89]).should.be.a.Number.and.approximately(0.558, 0.001);
    gini.unordered([3.76, 6.9, 4.99, 62.8, 0.54]).should.be.a.Number.and.approximately(0.646, 0.001);
    gini.unordered([9.1, 43, 11.8, 20]).should.be.a.Number.and.approximately(0.327, 0.001);
    gini.unordered([93, 81, 59, 86, 10, 89, 12]).should.be.a.Number.and.approximately(0.286, 0.001);
    gini.unordered([1907645172, 3, 5]).should.be.a.Number.and.approximately(0.667, 0.001);
    gini.unordered([92827420.5, 6, 2.5, 713, 40, 1002.55]).should.be.a.Number.and.approximately(0.833, 0.001);
  });
});
