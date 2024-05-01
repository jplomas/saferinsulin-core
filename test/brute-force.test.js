import { assert } from 'chai';
import { describe } from 'mocha';
import { ongoingRate } from '../out-tsc/src/calc.js';

// Brute force checking all possible values in front-end

let r = null;
let errors = false;

for (let a = 31; a < 301; a += 1) {
  for (let b = 31; b < 301; b += 1) {
    for (let c = 0; c < 151; c += 1) {
      r = ongoingRate(a / 10, b / 10, c / 10);
      if (r.rateNum < 0) {
        // console.log(`Issue found when parameters ${a / 10} | ${b / 10} | ${c / 10} used`);
        errors = true;
      }
    }
  }
}

describe('Brute force checks', () => {
  it('Brute force checks pass', () => {
    assert.equal(errors, false);
  });
});
