export interface FunctionCoefficients {
  a: number;
  b: number;
  c: number;
  p: number;
  q: number;
}

export interface Fraction {
  num: number;
  den: number;
}

export interface Point2D {
  x: number;
  y: number;
  label?: string;
  exactX?: string;
  exactY?: string;
}

export interface ExtremumPoint extends Point2D {
  type: 'max' | 'min';
  xExact: string;
  yExact: string;
  xClean?: string;
  yClean?: string;
}

export interface Asymptotes {
  vertical: {
    x: number;
    equation: string;
    exactX: string;
    latex: string;
  };
  oblique: {
    m: number;
    n: number;
    equation: string;
    exactM: string;
    exactN: string;
    latex: string;
    divisionRemainder: number;
    divisionStepsLatex: string;
  };
}

export interface SymmetryCenter extends Point2D {
  exactX: string;
  exactY: string;
  latex: string;
}

export interface DerivativeAnalysis {
  A: number;
  B: number;
  C: number;
  delta: number;
  roots: number[];
  formulaLatex: string;
  stepByStepLatex: string;
  simplifiedLatex: string;
  equationLatex: string;
  rootsLatex: string[];
}

export interface LimitsAnalysis {
  posInf: string;
  negInf: string;
  vertLeft: string;
  vertRight: string;
}

export interface Intercepts {
  ox: Point2D[];
  oy: Point2D | null;
}

export interface VariationTableRow {
  x: string;
  yPrime: string;
  y: string;
  xVal?: number;
  isAsymptote?: boolean;
  isExtremum?: boolean;
  extremumType?: 'max' | 'min';
}

export interface RationalAnalysisResult {
  coefficients: FunctionCoefficients;
  isValid: boolean;
  validationError?: string;
  
  // 1. Formula
  latexFormula: string;
  
  // 2. Domain
  domainLatex: string;
  excludedPoint: number;
  excludedPointExact: string;
  
  // 3. Derivative & roots
  derivative: DerivativeAnalysis;
  
  // 4. Extrema
  extrema: ExtremumPoint[];
  hasExtrema: boolean;
  extremaLineEquation?: string;
  
  // 5. Monotonic intervals
  increasingIntervals: string[];
  decreasingIntervals: string[];
  
  // 6. Limits
  limits: LimitsAnalysis;
  
  // 7. Asymptotes
  asymptotes: Asymptotes;
  
  // 8. Symmetry Center
  symmetryCenter: SymmetryCenter;
  
  // 9. Intercepts
  intercepts: Intercepts;
  
  // 10. Table of variation data
  tablePoints: {
    x: number;
    label: string;
    yVal?: number;
    yPrimeSign?: string;
    isAsymptote?: boolean;
    arrow?: 'up' | 'down';
    limitLeft?: string;
    limitRight?: string;
    extremumType?: 'max' | 'min';
  }[];
}

export interface DisplayLayers {
  graph: boolean;
  verticalAsymptote: boolean;
  obliqueAsymptote: boolean;
  localMax: boolean;
  localMin: boolean;
  symmetryCenter: boolean;
  oxIntercepts: boolean;
  oyIntercept: boolean;
  grid: boolean;
  coordinates: boolean;
  symmetrySegment: boolean;
  extremaLine: boolean;
  symmetryProbe: boolean;
}
