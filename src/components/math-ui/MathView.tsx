import { MathFormula, MathFormulaProps, MathText } from './MathFormula';

export { MathFormula, MathText };
export type { MathFormulaProps as MathViewProps };

/**
 * Re-export MathFormula as MathView for seamless backwards-compatibility
 */
export const MathView = MathFormula;
export default MathView;
