/* global describe, it */
// const { expect } = require('chai');
import { assert } from "chai";
import calc from "../src/calc.js";
import { describe } from "mocha";

describe("Function when starting patient on Insulin", () => {
  it("When glucose is 3.0 should trigger hypoglycaemia alerts", () => {
    const r = calc.startingRate(3);
    assert.equal(r.rate, "N/A");
    assert.equal(r.rateNum, 0);
  });
  it("Fail if negative glucose reading passed", () => {
    const r = calc.startingRate(-3);
    assert.equal(r, false);
  });
  it("When glucose is 30.0 should start at 4ml/hr", () => {
    const r = calc.startingRate(30);
    assert.equal(r.rate, 4);
  });
  it("When glucose is 11.2 should start at 1ml/hr", () => {
    const r = calc.startingRate(11.2);
    assert.equal(r.rate, 1);
  });
  it("When glucose is 14.5 should start at 2ml/hr", () => {
    const r = calc.startingRate(14.5);
    assert.equal(r.rate, 2);
  });
  it("When glucose is 15.6 should start at 3ml/hr", () => {
    const r = calc.startingRate(15.6);
    assert.equal(r.rate, 3);
  });
  it("When glucose is 6.4 should state insulin nor required", () => {
    const r = calc.startingRate(6.4);
    assert.equal(r.rate, "N/A");
  });
  it("When glucose greater than 30.0 should start at 4ml/hr", () => {
    const r = calc.startingRate(60);
    assert.equal(r.rate, 4);
  });
  it("When called with no parameter will return false", () => {
    const r = calc.startingRate();
    assert.equal(r, false);
  });
  it("When called with a string that cannot be parsed into a float will return false", () => {
    const r = calc.startingRate("NULL");
    assert.equal(r, false);
  });
  it("When called with a -ve value reports a rate of false", () => {
    const r = calc.startingRate(-10.2);
    assert.equal(r, false);
  });
});

describe("Governance function", () => {
  it("When called with no parameter will report as null", () => {
    const r = calc.governance();
    assert.equal(r, null);
  });
  it("When called with an invalid code structure will report as null", () => {
    const r = calc.governance("A2-BBC43-AEFF");
    assert.equal(r, null);
  });
  it("When called with an invalid code structure will report as null", () => {
    const r = calc.governance(null);
    assert.equal(r, null);
  });
  it("When called with 9403b059-b81c6b will report correct output", () => {
    const r = calc.governance("9403b059-b81c6b");
    const d = r.date.substring(0, 33);
    assert.equal(r.function, "b");
    assert.equal(r.current, 5.9);
    assert.equal(r.last, 8.9);
    assert.equal(r.rate, 14.8);
    assert.equal(d, "Fri Nov 01 2019 13:21:00 GMT+0000");
  });
  it("When called with 0bc-a81c71 will report correct output", () => {
    const r = calc.governance("0bc-a81c71");
    const d = r.date.substring(0, 33);
    assert.equal(r.function, "a");
    assert.equal(r.current, 18.8);
    assert.equal(r.last, null);
    assert.equal(r.rate, null);
    assert.equal(d, "Fri Nov 01 2019 13:27:00 GMT+0000");
  });
});

describe("Function when adjusting an ongoing Insulin infusion", () => {
  it("When called with no parameter will report false", () => {
    const r = calc.ongoingRate();
    assert.equal(r, false);
  });
  it("When called with 1 missing parameter report false", () => {
    const r = calc.ongoingRate(10, 10);
    assert.equal(r, false);
  });
  it("When called with 2 missing parameters report false", () => {
    const r = calc.ongoingRate(10);
    assert.equal(r, false);
  });
  it("When called with 3 NaN parameters report false", () => {
    const r = calc.ongoingRate(NaN, NaN, NaN);
    assert.equal(r, false);
  });
  it("When called with 2 NaN parameters report false", () => {
    const r = calc.ongoingRate(NaN, 8, NaN);
    assert.equal(r, false);
  });
  it("When called with 1 NaN parameters report false", () => {
    const r = calc.ongoingRate(NaN, 8, 1);
    assert.equal(r, false);
  });
  it("When called with hypoglycaemic current reading (1.3), rate is 0", () => {
    const r = calc.ongoingRate(1.3, 12.1, 1.0);
    assert.equal(r.rateNum, 0);
  });
  it("When called with hypoglycaemic current reading (2.4), rate is 0", () => {
    const r = calc.ongoingRate(2.4, 12.1, 1.0);
    assert.equal(r.rateNum, 0);
  });
  it("When all is stable, carry on... (current=8.6, previous=8.9, rate=1.0)", () => {
    const r = calc.ongoingRate(8.6, 8.9, 1.0);
    assert.equal(r.rateNum, 1);
  });
  it("When current=8, previous=11, rate=5 => new rate 3.6", () => {
    const r = calc.ongoingRate(8, 11, 5);
    assert.equal(r.rateNum, 3.6);
  });
  it("When current=8.2, previous=20, rate=1 => new rate 0.4", () => {
    const r = calc.ongoingRate(8.2, 20, 1);
    assert.equal(r.rateNum, 0.4);
  });
  it("When current=16, previous=11.5, rate=2 => new rate 4.8", () => {
    const r = calc.ongoingRate(16, 11.5, 2);
    assert.equal(r.rateNum, 4.8);
  });
  it("When current=11, previous=10.9, rate=1 => new rate 2", () => {
    const r = calc.ongoingRate(11, 10.9, 1);
    assert.equal(r.rateNum, 2);
  });
  it("When current=10.5, previous=12.7, rate=1 => new rate 0.8", () => {
    const r = calc.ongoingRate(10.5, 12.7, 1);
    assert.equal(r.rateNum, 0.8);
  });
  it("When current=11.1, previous=11.4, rate=2.2 => new rate 2.2", () => {
    const r = calc.ongoingRate(11.1, 11.4, 2.2);
    assert.equal(r.rateNum, 2.2);
  });
  it("When current=13, previous=10, rate=2 => new rate 4", () => {
    const r = calc.ongoingRate(13, 10, 2);
    assert.equal(r.rateNum, 4);
  });
  it("When current=13, previous=12.9, rate=2 => new rate 3", () => {
    const r = calc.ongoingRate(13, 12.9, 2);
    assert.equal(r.rateNum, 3);
  });
  it("When current=12.5, previous=13, rate=2 => new rate 3", () => {
    const r = calc.ongoingRate(12.5, 13, 2);
    assert.equal(r.rateNum, 3);
  });
  it("When current=11.7, previous=12.7, rate=2.2 => carry on at rate 2.2", () => {
    const r = calc.ongoingRate(11.7, 12.7, 2.2);
    assert.equal(r.rateNum, 2.2);
  });
  it("When current=5.2, previous=5, rate=2.2 => new rate 0", () => {
    const r = calc.ongoingRate(5.2, 5, 2.2);
    assert.equal(r.rateNum, 0);
  });
  it("When current=6.2, previous=8.1, rate=2.2 => new rate 1.1", () => {
    const r = calc.ongoingRate(6.2, 8.1, 2.2);
    assert.equal(r.rateNum, 1.1);
  });
  it("When current=7.1, previous=7.1, rate=2.2 => new rate 1.1", () => {
    const r = calc.ongoingRate(7.1, 7.1, 2.2);
    assert.equal(r.rateNum, 1.1);
  });
  it("When current=5.1, previous=6.8, rate=1.1 => new rate 0", () => {
    const r = calc.ongoingRate(5.1, 6.8, 1.1);
    assert.equal(r.rateNum, 0);
  });
  it("When current=13.1, previous=24, rate=2.0 => new rate 1.1", () => {
    const r = calc.ongoingRate(13.1, 24, 2.0);
    assert.equal(r.rateNum, 1.1);
  });
  it("When current=5.8, previous=7, rate=2.0 => new rate 0", () => {
    const r = calc.ongoingRate(5.8, 7, 2.0);
    assert.equal(r.rateNum, 0);
  });
  it("When current=7, previous=3.1, rate=0 => new rate 0", () => {
    const r = calc.ongoingRate(7, 3.1, 0);
    assert.equal(r.rateNum, 0);
  });
  it("When current=7, previous=3.1, rate=0.1 => new rate 0", () => {
    const r = calc.ongoingRate(7, 3.1, 0.1);
    assert.equal(r.rateNum, 0);
  });
  it("When current=13, previous=15, rate=2 => carry on at rate 2", () => {
    const r = calc.ongoingRate(13, 15, 2);
    assert.equal(r.rateNum, 2);
  });
  it("When current=14.2, previous=17, rate=3 => carry on at rate 3", () => {
    const r = calc.ongoingRate(14.2, 17, 3);
    assert.equal(r.rateNum, 3);
  });
  it("When current=14.2, previous=27, rate=3 => new rate 1.6", () => {
    const r = calc.ongoingRate(14.2, 27, 3);
    assert.equal(r.rateNum, 1.6);
  });
  it("When current=12.3, previous=17.5, rate=2 => new rate 1.4", () => {
    const r = calc.ongoingRate(12.3, 17.5, 2);
    assert.equal(r.rateNum, 1.4);
  });
  it("When current=15, previous=13, rate=2 => new rate 4", () => {
    const r = calc.ongoingRate(15, 13, 2);
    assert.equal(r.rateNum, 4);
  });
  it("When current=16, previous=15, rate=3 => new rate 5.1", () => {
    const r = calc.ongoingRate(16, 15, 3);
    assert.equal(r.rateNum, 5.1);
  });
  it("Upper limit of rate returned is 18ml/hr", () => {
    const r = calc.ongoingRate(17.1, 17.1, 19);
    assert.equal(r.rateNum, 18);
  });
  it("Returns false when 3 NaNs passed", () => {
    const r = calc.ongoingRate(NaN, NaN, NaN);
    assert.equal(r, false);
  });
});

describe("createGovernance ancillary function", () => {
  it("Returns false when passed with unknown algorithm", () => {
    const r = calc.createGovernance({ f: "x" });
    assert.equal(r, false);
  });
});
