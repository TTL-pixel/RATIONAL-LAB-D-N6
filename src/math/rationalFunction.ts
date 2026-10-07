import { 
  FunctionCoefficients, 
  RationalAnalysisResult, 
  ExtremumPoint, 
  Point2D 
} from '../types/math';
import { 
  formatFraction, 
  formatQuadratic, 
  formatLinear, 
  formatDecimal,
  formatLinearEquation,
  toFraction,
  simplifySquareRoot,
  formatRadicalExpression
} from './fraction';

export function evaluateRational(x: number, coeffs: FunctionCoefficients): number | null {
  const { a, b, c, p, q } = coeffs;
  const denom = p * x + q;
  if (Math.abs(denom) < 1e-9) return null;
  return (a * x * x + b * x + c) / denom;
}

export function evaluateDerivative(x: number, coeffs: FunctionCoefficients): number | null {
  const { a, b, c, p, q } = coeffs;
  const denom = p * x + q;
  if (Math.abs(denom) < 1e-9) return null;
  const A = a * p;
  const B = 2 * a * q;
  const C = b * q - c * p;
  return (A * x * x + B * x + C) / (denom * denom);
}

export function analyzeRationalFunction(coeffs: FunctionCoefficients): RationalAnalysisResult {
  const { a, b, c, p, q } = coeffs;

  // Validation
  if (a === 0) {
    return createInvalidResult(coeffs, 'Hệ số a phải khác 0 (đây là hàm phân thức bậc 2 trên bậc 1).');
  }
  if (p === 0) {
    return createInvalidResult(coeffs, 'Hệ số p phải khác 0 (mẫu số phải chứa biến x bậc 1).');
  }

  // Check if numerator is divisible by denominator:
  // Root of denominator is x0 = -q/p
  // Numerator evaluated at -q/p is N(-q/p) = (a*q^2 - b*p*q + c*p^2) / p^2
  const divCheck = a * q * q - b * p * q + c * p * p;
  if (Math.abs(divCheck) < 1e-7) {
    return createInvalidResult(
      coeffs,
      'Tử thức đang chia hết cho mẫu thức (đồ thị sẽ suy biến thành đường thẳng thủng điểm), vui lòng chọn bộ hệ số khác.'
    );
  }

  // 1. Formula LaTeX
  const numLatex = formatQuadratic(a, b, c);
  const denLatex = formatLinear(p, q);
  const latexFormula = `y = \\frac{${numLatex}}{${denLatex}}`;

  // 2. Domain
  const x0 = -q / p;
  const x0Exact = formatFraction(-q, p);
  const domainLatex = `D = \\mathbb{R} \\setminus \\left\\{ ${x0Exact} \\right\\}`;

  // 3. Polynomial Division for Oblique Asymptote:
  // (a*x^2 + b*x + c) / (p*x + q) = m*x + n + R/(p*x + q)
  // m = a/p
  // n = (b*p - a*q) / p^2
  // R = (a*q^2 - b*p*q + c*p^2) / p^2
  const m = a / p;
  const mExact = formatFraction(a, p);
  const nNum = b * p - a * q;
  const nDen = p * p;
  const n = nNum / nDen;
  const nExact = formatFraction(nNum, nDen);
  const remNum = divCheck;
  const remDen = p * p;
  const remainder = remNum / remDen;
  const remExact = formatFraction(remNum, remDen);

  const obliqueLineLatex = formatLinearEquation(a, p, nNum, nDen);
  const obliqueQuotientOnly = formatLinearEquation(a, p, nNum, nDen).replace('y = ', '');
  
  // Format clean remainder addition/subtraction
  let remTermLatex = '';
  const gcdHelper = (x: number, y: number): number => {
    let u = Math.abs(x), v = Math.abs(y);
    while (v) { const t = v; v = u % v; u = t; }
    return u || 1;
  };
  const g = gcdHelper(remNum, remDen);
  const sNum = remNum / g;
  const sDen = remDen / g;
  if (sDen === 1) {
    if (sNum > 0) {
      remTermLatex = `+ \\frac{${sNum}}{${denLatex}}`;
    } else {
      remTermLatex = `- \\frac{${Math.abs(sNum)}}{${denLatex}}`;
    }
  } else {
    if (sNum > 0) {
      remTermLatex = `+ \\frac{${sNum}}{${sDen}\\left(${denLatex}\\right)}`;
    } else {
      remTermLatex = `- \\frac{${Math.abs(sNum)}}{${sDen}\\left(${denLatex}\\right)}`;
    }
  }
  const divisionStepsLatex = `\\frac{${numLatex}}{${denLatex}} = \\left( ${obliqueQuotientOnly} \\right) ${remTermLatex}`;

  // 4. Derivative Analysis
  // y' = [(2ax+b)(px+q) - p(ax^2+bx+c)] / (px+q)^2
  // Numerator = (2ap - ap)x^2 + (2aq + bp - bp)x + (bq - cp)
  // = ap*x^2 + 2aq*x + (bq - cp)
  const A = a * p;
  const B = 2 * a * q;
  const C = b * q - c * p;
  const delta = B * B - 4 * A * C;

  const uPrimeStr = formatLinear(2 * a, b);
  const vStr = formatLinear(p, q);
  const pFactorStr = p === 1 ? `(${numLatex})` : p === -1 ? `(-1)(${numLatex})` : `${p}(${numLatex})`;
  const derivNumExpanded = `(${uPrimeStr})(${vStr}) - ${pFactorStr}`;
  const derivSimplified = formatQuadratic(A, B, C);
  const derivFormulaLatex = `y' = \\frac{${derivNumExpanded}}{\\left(${denLatex}\\right)^2} = \\frac{${derivSimplified}}{\\left(${denLatex}\\right)^2}`;

  let roots: number[] = [];
  let rootsLatex: string[] = [];
  let rootsClean: string[] = [];

  // Variables for exact radical computation of extrema
  let root1Exact = { latex: '', clean: '' };
  let root2Exact = { latex: '', clean: '' };
  let y1Exact = { latex: '', clean: '' };
  let y2Exact = { latex: '', clean: '' };

  if (delta > 1e-9) {
    const sqrtDelta = Math.sqrt(delta);
    const x0Val = -B / (2 * A);
    const halfWidth = sqrtDelta / (2 * Math.abs(A));
    const x1 = x0Val - halfWidth;
    const x2 = x0Val + halfWidth;
    roots = [x1, x2];

    // Numerator u = -B, denominator v = 2A
    // Make denominator v > 0 by multiplying top and bottom by sign(A)
    const sgnA = Math.sign(A);
    const uX = -B * sgnA;
    const vX = 2 * Math.abs(A);

    const { coeff: kX, radical: dX } = simplifySquareRoot(Math.round(delta));

    // For x1 (smaller root): minus radical
    root1Exact = formatRadicalExpression(uX, -1, kX, dX, vX);
    // For x2 (larger root): plus radical
    root2Exact = formatRadicalExpression(uX, 1, kX, dX, vX);

    rootsLatex = [root1Exact.latex, root2Exact.latex];
    rootsClean = [root1Exact.clean, root2Exact.clean];

    // Compute exact y at extrema using high school formula:
    // y = (2ax + b) / p
    // Substituting x = (uX \pm kX*sqrt(dX)) / vX:
    // y = [(2a*uX + b*vX) \pm (2a*kX)*sqrt(dX)] / (p*vX)
    const uY = 2 * a * uX + b * vX;
    const rawKY = 2 * a * kX;
    const vY = p * vX;

    // For root 1 (x1):
    let sgnY1: 1 | -1 = -1;
    let kY1 = rawKY;
    if (kY1 < 0) {
      kY1 = -kY1;
      sgnY1 = 1;
    }
    y1Exact = formatRadicalExpression(uY, sgnY1, kY1, dX, vY);

    // For root 2 (x2):
    let sgnY2: 1 | -1 = 1;
    let kY2 = rawKY;
    if (kY2 < 0) {
      kY2 = -kY2;
      sgnY2 = -1;
    }
    y2Exact = formatRadicalExpression(uY, sgnY2, kY2, dX, vY);
  } else if (Math.abs(delta) <= 1e-9) {
    const r = -B / (2 * A);
    roots = [r];
    const rFrac = formatFraction(-B, 2 * A);
    rootsLatex = [rFrac];
    rootsClean = [rFrac.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')];
  }

  // 5. Extrema
  const extrema: ExtremumPoint[] = [];
  const hasExtrema = delta > 1e-9;

  if (hasExtrema) {
    const x1 = roots[0];
    const x2 = roots[1];
    const y1 = evaluateRational(x1, coeffs)!;
    const y2 = evaluateRational(x2, coeffs)!;

    // Determine type: sign of A dictates parabola direction
    // If A > 0: positive outside roots (+, -, +) => x1 is MAX, x2 is MIN
    // If A < 0: negative outside roots (-, +, -) => x1 is MIN, x2 is MAX
    const type1: 'max' | 'min' = A > 0 ? 'max' : 'min';
    const type2: 'max' | 'min' = A > 0 ? 'min' : 'max';

    extrema.push({
      x: x1,
      y: y1,
      type: type1,
      xExact: root1Exact.latex || formatDecimal(x1),
      yExact: y1Exact.latex || formatDecimal(y1),
      xClean: root1Exact.clean || formatDecimal(x1),
      yClean: y1Exact.clean || formatDecimal(y1),
      label: type1 === 'max' ? 'Điểm Cực đại A' : 'Điểm Cực tiểu A',
    });

    extrema.push({
      x: x2,
      y: y2,
      type: type2,
      xExact: root2Exact.latex || formatDecimal(x2),
      yExact: y2Exact.latex || formatDecimal(y2),
      xClean: root2Exact.clean || formatDecimal(x2),
      yClean: y2Exact.clean || formatDecimal(y2),
      label: type2 === 'max' ? 'Điểm Cực đại B' : 'Điểm Cực tiểu B',
    });
  }

  // Line through 2 extrema: y = u'(x)/v'(x) = (2ax + b) / p = (2a/p)x + b/p
  const extremaLineM = (2 * a) / p;
  const extremaLineN = b / p;
  const extremaLineEquation = formatLinearEquation(2 * a, p, b, p);

  // 6. Monotonic intervals
  const increasingIntervals: string[] = [];
  const decreasingIntervals: string[] = [];

  if (hasExtrema) {
    const r1Str = rootsLatex[0] || formatDecimal(roots[0]);
    const r2Str = rootsLatex[1] || formatDecimal(roots[1]);
    const x0Str = x0Exact;

    if (A > 0) {
      increasingIntervals.push(`(-\\infty; ${r1Str})`, `(${r2Str}; +\\infty)`);
      decreasingIntervals.push(`(${r1Str}; ${x0Str})`, `(${x0Str}; ${r2Str})`);
    } else {
      decreasingIntervals.push(`(-\\infty; ${r1Str})`, `(${r2Str}; +\\infty)`);
      increasingIntervals.push(`(${r1Str}; ${x0Str})`, `(${x0Str}; ${r2Str})`);
    }
  } else {
    if (A > 0) {
      increasingIntervals.push(`(-\\infty; ${x0Exact})`, `(${x0Exact}; +\\infty)`);
    } else {
      decreasingIntervals.push(`(-\\infty; ${x0Exact})`, `(${x0Exact}; +\\infty)`);
    }
  }

  // 7. Limits
  // At +/- infinity: lim = lim (a/p * x)
  const posInf = m > 0 ? '+\\infty' : '-\\infty';
  const negInf = m > 0 ? '-\\infty' : '+\\infty';

  // Near vertical asymptote x -> x0^- and x -> x0^+
  // f(x) = mx + n + R/(p(x - x0))
  // If p > 0: x -> x0^- means denom -> 0^-, so sign of R determines limit
  // If p < 0: x -> x0^- means p*x + q -> 0^+
  const leftDenomSign = -Math.sign(p);
  const rightDenomSign = Math.sign(p);
  const leftLimitSign = Math.sign(remainder) * leftDenomSign;
  const rightLimitSign = Math.sign(remainder) * rightDenomSign;

  const vertLeft = leftLimitSign > 0 ? '+\\infty' : '-\\infty';
  const vertRight = rightLimitSign > 0 ? '+\\infty' : '-\\infty';

  // 8. Center of Symmetry: I(-q/p, (bp - 2aq)/p^2)
  const yI_num = b * p - 2 * a * q;
  const yI_den = p * p;
  const yI = yI_num / yI_den;
  const yIExact = formatFraction(yI_num, yI_den);

  const symmetryCenter = {
    x: x0,
    y: yI,
    exactX: x0Exact,
    exactY: yIExact,
    latex: `I\\left(${x0Exact};\\, ${yIExact}\\right)`,
    label: 'Tâm đối xứng I',
  };

  // 9. Intercepts
  const ox: Point2D[] = [];
  const deltaN = b * b - 4 * a * c;
  if (deltaN > 1e-9) {
    const { coeff: kN, radical: dN } = simplifySquareRoot(Math.round(deltaN));
    const sgnA = Math.sign(a);
    const uN = -b * sgnA;
    const vN = 2 * Math.abs(a);
    const rootN1 = formatRadicalExpression(uN, -1, kN, dN, vN);
    const rootN2 = formatRadicalExpression(uN, 1, kN, dN, vN);
    const ox1 = (-b - Math.sqrt(deltaN)) / (2 * a);
    const ox2 = (-b + Math.sqrt(deltaN)) / (2 * a);
    ox.push({ x: ox1, y: 0, exactX: rootN1.latex, exactY: '0', label: `Giao Ox (${rootN1.clean}; 0)` });
    ox.push({ x: ox2, y: 0, exactX: rootN2.latex, exactY: '0', label: `Giao Ox (${rootN2.clean}; 0)` });
  } else if (Math.abs(deltaN) <= 1e-9) {
    const ox1 = -b / (2 * a);
    const oxExact = formatFraction(-b, 2 * a);
    ox.push({ x: ox1, y: 0, exactX: oxExact, exactY: '0', label: `Giao Ox (${oxExact}; 0)` });
  }

  let oy: Point2D | null = null;
  if (q !== 0) {
    const oyVal = c / q;
    const oyExact = formatFraction(c, q);
    oy = { x: 0, y: oyVal, exactX: '0', exactY: oyExact, label: `Giao Oy (0; ${oyExact})` };
  }

  // 10. Table points builder for Variation Table
  const tablePoints = [];
  if (hasExtrema) {
    tablePoints.push({
      x: roots[0],
      label: rootsLatex[0] || formatDecimal(roots[0]),
      yVal: extrema[0]?.y,
      isExtremum: true,
      extremumType: extrema[0]?.type,
    });
    tablePoints.push({
      x: x0,
      label: x0Exact,
      isAsymptote: true,
      limitLeft: vertLeft,
      limitRight: vertRight,
    });
    tablePoints.push({
      x: roots[1],
      label: rootsLatex[1] || formatDecimal(roots[1]),
      yVal: extrema[1]?.y,
      isExtremum: true,
      extremumType: extrema[1]?.type,
    });
  } else {
    tablePoints.push({
      x: x0,
      label: x0Exact,
      isAsymptote: true,
      limitLeft: vertLeft,
      limitRight: vertRight,
    });
  }

  return {
    coefficients: coeffs,
    isValid: true,
    latexFormula,
    domainLatex,
    excludedPoint: x0,
    excludedPointExact: x0Exact,
    derivative: {
      A,
      B,
      C,
      delta,
      roots,
      formulaLatex: derivFormulaLatex,
      stepByStepLatex: `y' = \\frac{(${2 * a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)})(${p}x ${q >= 0 ? '+' : '-'} ${Math.abs(q)}) - ${p}(${numLatex})}{(${denLatex})^2}`,
      simplifiedLatex: `y' = \\frac{${derivSimplified}}{(${denLatex})^2}`,
      equationLatex: `${derivSimplified} = 0`,
      rootsLatex,
    },
    extrema,
    hasExtrema,
    extremaLineEquation,
    increasingIntervals,
    decreasingIntervals,
    limits: {
      posInf,
      negInf,
      vertLeft,
      vertRight,
    },
    asymptotes: {
      vertical: {
        x: x0,
        equation: `x = ${x0Exact}`,
        exactX: x0Exact,
        latex: `x = ${x0Exact}`,
      },
      oblique: {
        m,
        n,
        equation: obliqueLineLatex,
        exactM: mExact,
        exactN: nExact,
        latex: obliqueLineLatex,
        divisionRemainder: remainder,
        divisionStepsLatex,
      },
    },
    symmetryCenter,
    intercepts: { ox, oy },
    tablePoints,
  };
}

function createInvalidResult(coeffs: FunctionCoefficients, message: string): RationalAnalysisResult {
  return {
    coefficients: coeffs,
    isValid: false,
    validationError: message,
    latexFormula: 'y = \\frac{ax^2+bx+c}{px+q}',
    domainLatex: 'D = \\emptyset',
    excludedPoint: 0,
    excludedPointExact: '0',
    derivative: {
      A: 0,
      B: 0,
      C: 0,
      delta: 0,
      roots: [],
      formulaLatex: '',
      stepByStepLatex: '',
      simplifiedLatex: '',
      equationLatex: '',
      rootsLatex: [],
    },
    extrema: [],
    hasExtrema: false,
    increasingIntervals: [],
    decreasingIntervals: [],
    limits: {
      posInf: '',
      negInf: '',
      vertLeft: '',
      vertRight: '',
    },
    asymptotes: {
      vertical: { x: 0, equation: '', exactX: '', latex: '' },
      oblique: { m: 0, n: 0, equation: '', exactM: '', exactN: '', latex: '', divisionRemainder: 0, divisionStepsLatex: '' },
    },
    symmetryCenter: { x: 0, y: 0, exactX: '0', exactY: '0', latex: 'I(0; 0)' },
    intercepts: { ox: [], oy: null },
    tablePoints: [],
  };
}
