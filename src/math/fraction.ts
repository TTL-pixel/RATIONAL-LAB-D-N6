// Fraction and mathematical formatting utilities

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function toFraction(val: number, tolerance = 1e-5): { num: number; den: number } {
  if (Number.isInteger(val)) {
    return { num: val, den: 1 };
  }
  
  let sign = val < 0 ? -1 : 1;
  val = Math.abs(val);

  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = val;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(val - h1 / k1) > val * tolerance && k1 < 1000);

  return { num: sign * h1, den: k1 };
}

export function formatFraction(num: number, den = 1): string {
  if (den === 0) return '\\infty';
  if (num === 0) return '0';
  
  if (den < 0) {
    num = -num;
    den = -den;
  }
  
  const g = gcd(num, den);
  num = num / g;
  den = den / g;

  if (den === 1) return `${num}`;
  if (num < 0) return `-\\frac{${Math.abs(num)}}{${den}}`;
  return `\\frac{${num}}{${den}}`;
}

export function formatDecimal(val: number, digits = 2): string {
  if (Number.isInteger(val)) return val.toString();
  return Number(val.toFixed(digits)).toString();
}

export function formatPolynomialTerm(coeff: number, power: number, isFirst = false): string {
  if (coeff === 0) return '';
  
  const sign = coeff > 0 ? (isFirst ? '' : ' + ') : (isFirst ? '-' : ' - ');
  const absCoeff = Math.abs(coeff);
  
  if (power === 0) {
    return `${sign}${absCoeff}`;
  }
  
  const coeffStr = absCoeff === 1 ? '' : absCoeff.toString();
  const varStr = power === 1 ? 'x' : `x^${power}`;
  
  return `${sign}${coeffStr}${varStr}`;
}

export function formatQuadratic(a: number, b: number, c: number): string {
  let res = formatPolynomialTerm(a, 2, true);
  const termB = formatPolynomialTerm(b, 1, res === '');
  const termC = formatPolynomialTerm(c, 0, res === '' && termB === '');
  
  res += termB + termC;
  return res || '0';
}

export function formatLinear(p: number, q: number): string {
  let res = formatPolynomialTerm(p, 1, true);
  const termQ = formatPolynomialTerm(q, 0, res === '');
  res += termQ;
  return res || '0';
}

export function formatLinearEquation(mNum: number, mDen: number, nNum: number, nDen: number): string {
  if (mDen === 0) return 'x = 0';
  
  if (mDen < 0) {
    mNum = -mNum;
    mDen = -mDen;
  }
  const gm = gcd(mNum, mDen);
  mNum = mNum / gm;
  mDen = mDen / gm;

  let mStr = '';
  if (mNum === 0) {
    mStr = '';
  } else if (mNum === 1 && mDen === 1) {
    mStr = 'x';
  } else if (mNum === -1 && mDen === 1) {
    mStr = '-x';
  } else if (mDen === 1) {
    mStr = `${mNum}x`;
  } else if (mNum < 0) {
    mStr = `-\\frac{${Math.abs(mNum)}}{${mDen}}x`;
  } else {
    mStr = `\\frac{${mNum}}{${mDen}}x`;
  }

  if (nDen < 0) {
    nNum = -nNum;
    nDen = -nDen;
  }
  const gn = gcd(nNum, nDen);
  nNum = nNum / gn;
  nDen = nDen / gn;

  if (nNum === 0) {
    return mStr ? `y = ${mStr}` : 'y = 0';
  }

  const sign = nNum > 0 ? (mStr ? ' + ' : '') : (mStr ? ' - ' : '-');
  const absN = Math.abs(nNum);
  const nStr = nDen === 1 ? `${absN}` : `\\frac{${absN}}{${nDen}}`;

  return mStr ? `y = ${mStr}${sign}${nStr}` : `y = ${sign}${nStr}`;
}

/**
 * Decomposes square root of an integer N into k * sqrt(d), where d is square-free.
 * E.g., simplifySquareRoot(24) -> { coeff: 2, radical: 6 } because sqrt(24) = 2*sqrt(6).
 * simplifySquareRoot(4) -> { coeff: 2, radical: 1 } because sqrt(4) = 2.
 */
export function simplifySquareRoot(n: number): { coeff: number; radical: number } {
  n = Math.abs(Math.round(n));
  if (n === 0) return { coeff: 0, radical: 0 };
  if (n === 1) return { coeff: 1, radical: 1 };

  let coeff = 1;
  let radical = n;

  for (let i = 2; i * i <= radical; i++) {
    const sq = i * i;
    while (radical % sq === 0) {
      coeff *= i;
      radical /= sq;
    }
  }

  return { coeff, radical };
}

/**
 * Accurately formats algebraic expression of the form:
 * (u + sgn * k * sqrt(d)) / v
 * into both simplified LaTeX and clean text representations.
 * Handles full cancellation of common factors between rational part, radical coeff, and denominator.
 * If denominator reduces to 1, removes the fraction completely (e.g. 1 - \sqrt{6} instead of \frac{2 - \sqrt{24}}{2}).
 */
export function formatRadicalExpression(
  u: number,
  sgn: 1 | -1,
  k: number,
  d: number,
  v: number
): { latex: string; clean: string } {
  u = Math.round(u);
  k = Math.round(k);
  d = Math.round(d);
  v = Math.round(v);

  if (v === 0) {
    return { latex: '\\infty', clean: '∞' };
  }

  // Ensure positive denominator
  if (v < 0) {
    u = -u;
    sgn = (sgn === 1 ? -1 : 1);
    v = -v;
  }

  // If no radical component or d is 0/1
  if (k === 0 || d === 0) {
    const num = u;
    const g = gcd(Math.abs(num), v);
    const n = num / g;
    const dRed = v / g;
    if (dRed === 1) {
      return { latex: `${n}`, clean: `${n}` };
    }
    if (n < 0) {
      return {
        latex: `-\\frac{${Math.abs(n)}}{${dRed}}`,
        clean: `-${Math.abs(n)}/${dRed}`,
      };
    }
    return {
      latex: `\\frac{${n}}{${dRed}}`,
      clean: `${n}/${dRed}`,
    };
  }

  if (d === 1) {
    const num = u + sgn * k;
    const g = gcd(Math.abs(num), v);
    const n = num / g;
    const dRed = v / g;
    if (dRed === 1) {
      return { latex: `${n}`, clean: `${n}` };
    }
    if (n < 0) {
      return {
        latex: `-\\frac{${Math.abs(n)}}{${dRed}}`,
        clean: `-${Math.abs(n)}/${dRed}`,
      };
    }
    return {
      latex: `\\frac{${n}}{${dRed}}`,
      clean: `${n}/${dRed}`,
    };
  }

  // d > 1 (irrational square root)
  // Find greatest common divisor of u, k, and v
  const g = gcd(gcd(Math.abs(u), k), v);
  const uPrime = u / g;
  const kPrime = k / g;
  const vPrime = v / g;

  const radLatex = kPrime === 1 ? `\\sqrt{${d}}` : `${kPrime}\\sqrt{${d}}`;
  const radClean = kPrime === 1 ? `√${d}` : `${kPrime}√${d}`;

  // Case 1: Pure radical (uPrime === 0)
  if (uPrime === 0) {
    if (sgn === 1) {
      if (vPrime === 1) {
        return { latex: radLatex, clean: radClean };
      }
      return {
        latex: `\\frac{${radLatex}}{${vPrime}}`,
        clean: `${radClean}/${vPrime}`,
      };
    } else {
      if (vPrime === 1) {
        return { latex: `-${radLatex}`, clean: `-${radClean}` };
      }
      return {
        latex: `-\\frac{${radLatex}}{${vPrime}}`,
        clean: `-${radClean}/${vPrime}`,
      };
    }
  }

  // Case 2: Mixed (uPrime != 0)
  const op = sgn === 1 ? '+' : '-';
  if (vPrime === 1) {
    return {
      latex: `${uPrime} ${op} ${radLatex}`,
      clean: `${uPrime} ${op} ${radClean}`,
    };
  }

  return {
    latex: `\\frac{${uPrime} ${op} ${radLatex}}{${vPrime}}`,
    clean: `(${uPrime} ${op} ${radClean})/${vPrime}`,
  };
}

