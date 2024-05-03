/* eslint no-console: 0, max-len: 0 */

function hexDateConvert(fr: string): Date {
  const dt = new Date();
  let f = parseInt(fr, 16);
  f += 25678678;
  dt.setTime(f * 60000);
  return dt;
}

function getHexDate(n: Date): string {
  let m = Math.floor(n.getTime() / 60000);
  m -= 25678678;
  const x = m.toString(16);
  return x;
}

function glucoseToHex(i: number | undefined): string {
  if (!i) {
    return 'failed';
  }
  const x = i * 10;
  let y = `00${x.toString(16).substr(-16)}`;
  y = y.slice(-3);
  return y;
}

function rateToHex(i: number | undefined): string {
  if (!i) {
    return 'failed';
  }
  const x = i * 10;
  let y = `0${x.toString(16).substr(-16)}`;
  y = y.slice(-2);
  return y;
}

function hexToFloat(i: string): number {
  return parseInt(i, 16) / 10;
}

function governance(
  hex: string
): { function: string; current: number | null; last: number | null; rate: number | null; date: string; version: string | null } | null {
  if (!hex) {
    return null;
  }
  const codes = hex.split('-');
  if (codes.length !== 2) {
    return null;
  }
  const f = codes[1].charAt(0);
  const d = hexDateConvert(codes[1].substr(1, codes[1].length));
  let version = null;
  let rate = null;
  let curr = null;
  let last = null;
  if (f === 'd' || f === 'a') {
    curr = hexToFloat(codes[0].substr(0, 3));
  }
  if (f === 'a' || f === 'b') {
    version = '1.0.0';
  }
  if (f === 'c' || f === 'd') {
    version = '2.0.0';
  }
  if (f === 'b' || f === 'c') {
    rate = hexToFloat(codes[0].substr(0, 2));
    curr = hexToFloat(codes[0].substr(2, 3));
    last = hexToFloat(codes[0].substr(5, 3));
  }
  if (version === null) {
    return null
  }
  return {
    function: f,
    current: curr,
    last,
    rate,
    date: d.toString(),
    version,
  };
}

function createGovernance(obj: {
  f: string;
  glucose?: number;
  rate?: number;
  current?: number;
  previous?: number | undefined;
}): string | false {
  const n = new Date();
  if (obj.f === 'a') {
    const hex = `${glucoseToHex(obj.glucose)}-a${getHexDate(n)}`;
    return hex;
  }
  if (obj.f === 'b') {
    const h = `${rateToHex(obj.rate) + glucoseToHex(obj.current) + glucoseToHex(obj.previous)}-c${getHexDate(n)}`;
    return h;
  }
  return false;
}

function startingRate(
  passedValue: string
): { advice: { type: string; text: (string | false)[] }; rate: string; rateNum: number; hex: string | false } | false {
  if (Number.isNaN(parseFloat(passedValue))) {
    return false;
  }
  const bg = parseFloat(passedValue);
  if (bg < 0) {
    return false;
  }
  let result: false | string = false;
  let rate = '';
  let rateNum = 0;
  if (bg <= 4) {
    result = 'Treat hypoglycaemia according to protocol';
    rate = 'N/A';
    rateNum = 0;
  }
  if (bg > 4 && bg <= 10) {
    result = 'No insulin required - recheck 4-6 hourly';
    rate = 'N/A';
    rateNum = 0;
  }
  if (bg > 10 && bg <= 12) {
    result = 'Start insulin at 1 unit/hr';
    rate = '1';
    rateNum = 1;
  }
  if (bg > 12 && bg <= 15) {
    result = 'Start insulin at 2 units/hr';
    rate = '2';
    rateNum = 2;
  }
  if (bg > 15 && bg <= 18) {
    result = 'Start insulin at 3 units/hr';
    rate = '3';
    rateNum = 3;
  }
  if (bg > 18) {
    result = 'Start insulin at 4 units/hr';
    rate = '4';
    rateNum = 4;
  }
  const hex = createGovernance({ f: 'a', glucose: bg });
  return {
    advice: { type: 'normal', text: [result] },
    rate,
    rateNum,
    hex,
  };
}

const ongoingRate = (passedCurrent: string, passedPrevious: string, passedRate: string) => {
  const r: { rateNum: number; rate: string; advice: { text: string[]; type: string }; hex: string | false } = {
    rateNum: 0,
    rate: '',
    advice: { text: [''], type: '' },
    hex: '',
  };
  if (
    Number.isNaN(parseFloat(passedCurrent)) ||
    Number.isNaN(parseFloat(passedPrevious)) ||
    Number.isNaN(parseFloat(passedRate))
  ) {
    return false;
  }
  let current: number = parseFloat(passedCurrent) * 10;
  let previous: number = parseFloat(passedPrevious) * 10;
  let rate: number = parseFloat(passedRate) * 10;
  let A11 = 'LOGIC ERROR';
  if (current <= 22) {
    A11 = '1';
  }
  if (current >= 23 && current <= 40) {
    A11 = '2';
  }
  if (current >= 41 && current < 61 && previous <= 60) {
    A11 = '3';
  }
  if (current >= 41 && current < 61 && previous > 60 && current - previous < -15) {
    A11 = '2';
  }
  if (current >= 41 && current < 61 && previous > 60 && current - previous >= -15 && current - previous < 0) {
    A11 = '3';
  }
  if (current >= 61 && current < 80 && rate <= 15) {
    A11 = '29';
  }
  if (current >= 61 && current < 80 && rate > 15) {
    A11 = '53';
  }
  if ((current >= 80 && current < 101) || (previous < 80 && previous > 100)) {
    A11 = '10';
  }
  if (current >= 80 && current < 101 && previous >= 80 && previous <= 100) {
    A11 = '54';
  }
  if (current >= 101 && current < 121 && previous <= 120 && current - previous < 0) {
    A11 = '17';
  }
  if (current >= 101 && current < 121 && previous <= 120 && current - previous >= 0) {
    A11 = '36';
  }
  if (current >= 101 && current < 121 && previous > 120 && current - previous < 0 && current - previous >= -20) {
    A11 = '32';
  }
  if (current >= 101 && current < 121 && previous > 120 && current - previous < -20) {
    A11 = '33';
  }
  if (current >= 121 && current <= 140 && previous < 121) {
    A11 = '34';
  }
  if (current >= 121 && current <= 140 && previous >= 121 && previous <= 140 && current - previous >= 0) {
    A11 = '35';
  }
  if (
    current >= 121 &&
    current <= 140 &&
    previous >= 122 &&
    previous <= 144 &&
    current - previous < 0 &&
    current - previous >= -10
  ) {
    A11 = '35';
  }
  if (
    current >= 121 &&
    current <= 140 &&
    previous >= 132 &&
    previous <= 180 &&
    current - previous <= -5 &&
    current - previous >= -39
  ) {
    A11 = '37';
  }
  if (current >= 121 && current <= 140 && previous >= 161 && previous <= 180 && current - previous <= -40) {
    A11 = '33';
  }
  if (current >= 121 && current <= 140 && previous > 180) {
    A11 = '33';
  }
  if (current > 140 && previous < 121) {
    A11 = '38';
  }
  if (current > 140 && previous >= 121 && previous <= 140) {
    A11 = '34';
  }
  if (current > 140 && previous > 140 && current - previous > 0) {
    A11 = '38';
  }
  if (current > 140 && previous > 140 && current - previous <= 0 && current - previous >= -19) {
    A11 = '34';
  }
  if (current > 140 && previous > 140 && current - previous < -19 && current - previous > -40) {
    A11 = '18';
  }
  if (current > 140 && previous > 140 && current - previous <= -40) {
    A11 = '33';
  }
  current = current / 10;
  previous = previous / 10;
  rate = rate / 10;
  let newR = -1;
  if (A11 === '1') {
    newR = 0;
  }
  if (A11 === '2') {
    newR = 0;
  }
  if (A11 === '3') {
    newR = 0;
  }
  if (A11 === '10') {
    newR = rate * (current / previous);
  }
  if (A11 === '17') {
    newR = rate;
  }
  if (A11 === '18') {
    newR = rate;
  }
  if (A11 === '29') {
    newR = 0;
  }
  if (A11 === '32') {
    newR = rate;
  }
  if (A11 === '33') {
    newR = rate * (current / previous);
  }
  if (A11 === '34') {
    newR = rate + 2;
  }
  if (A11 === '35') {
    newR = rate + 1;
  }
  if (A11 === '36') {
    newR = rate + 1;
  }
  if (A11 === '37') {
    newR = rate;
  }
  if (A11 === '38') {
    newR = rate + 2 * (current / previous);
  }
  if (A11 === '53') {
    newR = rate * 0.5;
  }
  if (A11 === '54') {
    newR = rate;
  }
  newR = Math.round(newR * 10) / 10;
  if (newR > 18) {
    newR = 18;
  }
  const result = `${newR}ml/hr`;
  r.rate = result;
  r.rateNum = newR;
  if (A11 === '1') {
    r.advice = {
      type: 'additional',
      text: [
        'STOP INSULIN FOR AT LEAST 1 HOUR',
        'Follow hypoglycaemia protocol.',
        'Give IV dextrose immediately & ensure background nutrition or glucose intake.',
        'Recheck blood glucose in 15, 30 and 60 minutes until stable.',
      ],
    };
  }
  if (A11 === '2') {
    r.advice = {
      type: 'additional',
      text: [
        'STOP INSULIN FOR AT LEAST 1 HOUR',
        'Give IV dextrose immediately if blood glucose < 4mmol/L & ensure background nutrition or glucose intake.',
        ' If blood glucose is greater than 4mmol/L then it is falling rapidly. Recheck blood glucose in 30 and 60 minutes.',
      ],
    };
  }
  if (A11 === '3') {
    r.advice = {
      type: 'additional',
      text: [
        'STOP INSULIN FOR AT LEAST 1 HOUR',
        'Ensure background nutrition or glucose intake. Recheck blood glucose in 1 hour.',
      ],
    };
  }
  if (A11 === '10') {
    r.advice = {
      type: 'additional',
      text: [
        'Recheck blood glucose in 1 hour.',
        'If blood glucose has been between 6-10mmol consider 2 hourly blood glucose checks.',
      ],
    };
  }
  if (A11 === '17') {
    r.advice = { type: 'additional', text: ['Recheck blood glucose in 1 hour. '] };
  }
  if (A11 === '18') {
    r.advice = {
      type: 'additional',
      text: ['Recheck blood glucose in 1-2 hours.', '(1 hour if drop in blood glucose > 2 mmol/L in last hour)'],
    };
  }
  if (A11 === '29') {
    r.advice = {
      type: 'additional',
      text: ['STOP INSULIN FOR AT LEAST 1 HOUR', 'Restart insulin if blood glucose > 10mmol/L'],
    };
  }
  if (A11 === '32') {
    r.advice = { type: 'additional', text: ['Recheck blood glucose in 2 hours.'] };
  }
  if (A11 === '33') {
    r.advice = { type: 'additional', text: ['Recheck blood glucose in 1 hour.'] };
  }
  if (A11 === '34') {
    r.advice = { type: 'additional', text: ['Recheck blood glucose in 1 hour.'] };
  }
  if (A11 === '35') {
    r.advice = { type: 'additional', text: ['Recheck blood glucose in 1 hour.'] };
  }
  if (A11 === '36') {
    r.advice = { type: 'additional', text: ['Recheck blood glucose in 2 hours.'] };
  }
  if (A11 === '37') {
    r.advice = { type: 'additional', text: ['Recheck blood glucose in 1 hour.'] };
  }
  if (A11 === '38') {
    r.advice = { type: 'additional', text: ['Recheck blood glucose in 1 hour.'] };
  }
  if (A11 === '53') {
    r.advice = {
      type: 'additional',
      text: ['Recheck blood glucose in 1 hour.', 'Caution as blood glucose is approaching bottom of target range.'],
    };
  }
  if (A11 === '54') {
    r.advice = {
      type: 'additional',
      text: ['If blood glucose and calorie intake have been stable for last 2 hours move to 2 hourly BG checks. '],
    };
  }
  const hex = createGovernance({
    f: 'b',
    rate,
    current,
    previous,
  });
  r.hex = hex;
  return r;
};

export { ongoingRate, startingRate, governance, rateToHex, glucoseToHex, getHexDate, createGovernance };
