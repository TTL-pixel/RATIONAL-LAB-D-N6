import React from 'react';
import { RationalAnalysisResult } from '../../types/math';
import { MathView } from './MathView';
import { Table } from 'lucide-react';

interface VariationTableProps {
  analysis: RationalAnalysisResult;
  compact?: boolean;
}

// Helper to format clean text for SVG rendering from latex/string
function cleanForSvg(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_m, num, den) => {
      const cNum = cleanForSvg(num);
      const cDen = cleanForSvg(den);
      if (cDen === '1') return cNum;
      if (cNum.includes('+') || cNum.includes('-')) {
        return `(${cNum})/${cDen}`;
      }
      return `${cNum}/${cDen}`;
    })
    .replace(/\\sqrt\{([^{}]+)\}/g, '√$1')
    .replace(/\\pm/g, '±')
    .replace(/\\infty/g, '∞')
    .replace(/\\left|\\right/g, '')
    .replace(/[{}\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const VariationTable: React.FC<VariationTableProps> = ({ analysis, compact = false }) => {
  if (!analysis.isValid) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-sm shadow-sm">
        Vui lòng thiết lập hàm số hợp lệ để hiển thị bảng biến thiên.
      </div>
    );
  }

  const { derivative, extrema, hasExtrema, excludedPointExact } = analysis;
  const A = derivative.A;
  const isAPositive = A > 0;

  // CASE 1: 2 EXTREMA (Delta > 0)
  if (hasExtrema && extrema.length >= 2) {
    const r1 = extrema[0];
    const r2 = extrema[1];

    const x1Clean = r1.xClean || cleanForSvg(r1.xExact);
    const x0Clean = cleanForSvg(excludedPointExact);
    const x2Clean = r2.xClean || cleanForSvg(r2.xExact);

    const y1Clean = r1.yClean || cleanForSvg(r1.yExact);
    const y2Clean = r2.yClean || cleanForSvg(r2.yExact);

    // When A > 0:
    // interval 1 (-inf, x1): y' is +, arrow 1 goes UP to y1 (CĐ)
    // interval 2 (x1, x0): y' is -, arrow 2 goes DOWN to -inf
    // x0: ||
    // interval 3 (x0, x2): y' is -, arrow 3 goes DOWN from +inf to y2 (CT)
    // interval 4 (x2, +inf): y' is +, arrow 4 goes UP from y2 (CT) to +inf
    //
    // When A < 0:
    // interval 1 (-inf, x1): y' is -, arrow 1 goes DOWN to y1 (CT)
    // interval 2 (x1, x0): y' is +, arrow 2 goes UP to +inf
    // x0: ||
    // interval 3 (x0, x2): y' is +, arrow 3 goes UP from -inf to y2 (CĐ)
    // interval 4 (x2, +inf): y' is -, arrow 4 goes DOWN from y2 (CĐ) to -inf

    return (
      <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ${compact ? 'p-3 sm:p-4' : 'p-5 sm:p-6'} shadow-md space-y-4 transition-colors`}>
        {!compact && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                BẢNG BIẾN THIÊN CHUẨN SGK (GIẢI TÍCH 12)
              </h3>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isAPositive ? 'Hệ số A > 0 (Cực đại trước, cực tiểu sau)' : 'Hệ số A < 0 (Cực tiểu trước, cực đại sau)'}
            </div>
          </div>
        )}

        {/* SVG Standard Textbook Variation Table */}
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[680px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl overflow-hidden p-2">
            <svg viewBox="0 0 720 220" className="w-full h-auto select-none font-serif block">
              <defs>
                <marker
                  id="arr-green-ext"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
                </marker>
                <marker
                  id="arr-red-ext"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
                </marker>
              </defs>

              {/* Table Horizontal Rule Lines */}
              {/* Top border */}
              <line x1="10" y1="8" x2="710" y2="8" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />
              {/* Line below x row */}
              <line x1="10" y1="46" x2="710" y2="46" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />
              {/* Line below y' row */}
              <line x1="10" y1="88" x2="710" y2="88" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />
              {/* Bottom border */}
              <line x1="10" y1="214" x2="710" y2="214" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />

              {/* Table Left Vertical Rule Line separating Header Labels from Data */}
              <line x1="82" y1="8" x2="82" y2="214" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />

              {/* HEADER LABELS (Left Column) */}
              <text x="46" y="32" fontSize="15" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-serif">
                x
              </text>
              <text x="46" y="72" fontSize="15" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-serif">
                y'
              </text>
              <text x="46" y="155" fontSize="15" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-serif">
                y
              </text>

              {/* ROW 1: x values */}
              {/* -inf at x = 115 */}
              <text x="115" y="31" fontSize="14" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400">
                -∞
              </text>
              {/* x1 at x = 245 */}
              <foreignObject x="175" y="8" width="140" height="34" className="overflow-visible pointer-events-none">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-cyan-400">
                  <MathView math={r1.xExact} />
                </div>
              </foreignObject>
              {/* x0 (asymptote) at x = 390 */}
              <foreignObject x="320" y="8" width="140" height="34" className="overflow-visible pointer-events-none">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-rose-500 dark:text-rose-400">
                  <MathView math={excludedPointExact} />
                </div>
              </foreignObject>
              {/* x2 at x = 535 */}
              <foreignObject x="465" y="8" width="140" height="34" className="overflow-visible pointer-events-none">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-cyan-400">
                  <MathView math={r2.xExact} />
                </div>
              </foreignObject>
              {/* +inf at x = 675 */}
              <text x="675" y="31" fontSize="14" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400">
                +∞
              </text>

              {/* ASYMPTOTE DOUBLE VERTICAL LINE (runs through y' and y rows at x0 = 390) */}
              <line x1="388" y1="46" x2="388" y2="214" stroke="#f43f5e" strokeWidth="1.5" />
              <line x1="392" y1="46" x2="392" y2="214" stroke="#f43f5e" strokeWidth="1.5" />

              {/* ROW 2: y' (f'(x)) signs & zeros */}
              {isAPositive ? (
                <>
                  {/* Interval 1 (-inf, x1): y' is + (arrow 1 goes UP) */}
                  <text x="175" y="73" fontSize="19" fontWeight="bold" textAnchor="middle" fill="#10b981">
                    +
                  </text>
                  {/* At x1: zero */}
                  <text x="245" y="72" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400 font-sans">
                    0
                  </text>
                  {/* Interval 2 (x1, x0): y' is - (arrow 2 goes DOWN) */}
                  <text x="315" y="73" fontSize="21" fontWeight="bold" textAnchor="middle" fill="#f43f5e">
                    -
                  </text>
                  {/* Interval 3 (x0, x2): y' is - (arrow 3 goes DOWN) */}
                  <text x="465" y="73" fontSize="21" fontWeight="bold" textAnchor="middle" fill="#f43f5e">
                    -
                  </text>
                  {/* At x2: zero */}
                  <text x="535" y="72" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400 font-sans">
                    0
                  </text>
                  {/* Interval 4 (x2, +inf): y' is + (arrow 4 goes UP) */}
                  <text x="605" y="73" fontSize="19" fontWeight="bold" textAnchor="middle" fill="#10b981">
                    +
                  </text>
                </>
              ) : (
                <>
                  {/* Interval 1 (-inf, x1): y' is - (arrow 1 goes DOWN) */}
                  <text x="175" y="73" fontSize="21" fontWeight="bold" textAnchor="middle" fill="#f43f5e">
                    -
                  </text>
                  {/* At x1: zero */}
                  <text x="245" y="72" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400 font-sans">
                    0
                  </text>
                  {/* Interval 2 (x1, x0): y' is + (arrow 2 goes UP) */}
                  <text x="315" y="73" fontSize="19" fontWeight="bold" textAnchor="middle" fill="#10b981">
                    +
                  </text>
                  {/* Interval 3 (x0, x2): y' is + (arrow 3 goes UP) */}
                  <text x="465" y="73" fontSize="19" fontWeight="bold" textAnchor="middle" fill="#10b981">
                    +
                  </text>
                  {/* At x2: zero */}
                  <text x="535" y="72" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400 font-sans">
                    0
                  </text>
                  {/* Interval 4 (x2, +inf): y' is - (arrow 4 goes DOWN) */}
                  <text x="605" y="73" fontSize="21" fontWeight="bold" textAnchor="middle" fill="#f43f5e">
                    -
                  </text>
                </>
              )}

              {/* ROW 3: y (f(x)) ARROWS & BOUNDARY / EXTREMA VALUES */}
              {isAPositive ? (
                <>
                  {/* --- LEFT BRANCH (A > 0) --- */}
                  {/* 1. Value at start: -inf */}
                  <text x="115" y="200" fontSize="13" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400">
                    -∞
                  </text>

                  {/* Arrow 1: UP from (-inf) to y1 (CĐ) under [+] */}
                  <line
                    x1="130"
                    y1="190"
                    x2="225"
                    y2="120"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    markerEnd="url(#arr-green-ext)"
                  />

                  {/* Peak at x1: Cực Đại y1 */}
                  <foreignObject x="175" y="94" width="140" height="28" className="overflow-visible pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">
                      <span className="mr-1 text-[11px] font-sans">CĐ:</span>
                      <MathView math={r1.yExact} />
                    </div>
                  </foreignObject>

                  {/* Arrow 2: DOWN from y1 to (-inf) under [-] */}
                  <line
                    x1="265"
                    y1="120"
                    x2="360"
                    y2="190"
                    stroke="#f43f5e"
                    strokeWidth="2.2"
                    markerEnd="url(#arr-red-ext)"
                  />

                  {/* Value at end of left branch: -inf */}
                  <text x="370" y="200" fontSize="13" textAnchor="middle" fill="#f43f5e">
                    -∞
                  </text>

                  {/* --- RIGHT BRANCH (A > 0) --- */}
                  {/* Value at start of right branch: +inf */}
                  <text x="410" y="112" fontSize="13" textAnchor="middle" fill="#f43f5e">
                    +∞
                  </text>

                  {/* Arrow 3: DOWN from (+inf) to y2 (CT) under [-] */}
                  <line
                    x1="425"
                    y1="120"
                    x2="515"
                    y2="190"
                    stroke="#f43f5e"
                    strokeWidth="2.2"
                    markerEnd="url(#arr-red-ext)"
                  />

                  {/* Valley at x2: Cực Tiểu y2 */}
                  <foreignObject x="465" y="190" width="140" height="28" className="overflow-visible pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <span className="mr-1 text-[11px] font-sans">CT:</span>
                      <MathView math={r2.yExact} />
                    </div>
                  </foreignObject>

                  {/* Arrow 4: UP from y2 to (+inf) under [+] */}
                  <line
                    x1="555"
                    y1="190"
                    x2="650"
                    y2="120"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    markerEnd="url(#arr-green-ext)"
                  />

                  {/* Value at end of right branch: +inf */}
                  <text x="675" y="112" fontSize="13" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400">
                    +∞
                  </text>
                </>
              ) : (
                <>
                  {/* --- LEFT BRANCH (A < 0) --- */}
                  {/* 1. Value at start: +inf */}
                  <text x="115" y="112" fontSize="13" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400">
                    +∞
                  </text>

                  {/* Arrow 1: DOWN from (+inf) to y1 (CT) under [-] */}
                  <line
                    x1="130"
                    y1="120"
                    x2="225"
                    y2="190"
                    stroke="#f43f5e"
                    strokeWidth="2.2"
                    markerEnd="url(#arr-red-ext)"
                  />

                  {/* Valley at x1: Cực Tiểu y1 */}
                  <foreignObject x="175" y="190" width="140" height="28" className="overflow-visible pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <span className="mr-1 text-[11px] font-sans">CT:</span>
                      <MathView math={r1.yExact} />
                    </div>
                  </foreignObject>

                  {/* Arrow 2: UP from y1 to (+inf) under [+] */}
                  <line
                    x1="265"
                    y1="190"
                    x2="360"
                    y2="120"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    markerEnd="url(#arr-green-ext)"
                  />

                  {/* Value at end of left branch: +inf */}
                  <text x="370" y="112" fontSize="13" textAnchor="middle" fill="#10b981">
                    +∞
                  </text>

                  {/* --- RIGHT BRANCH (A < 0) --- */}
                  {/* Value at start of right branch: -inf */}
                  <text x="410" y="200" fontSize="13" textAnchor="middle" fill="#f43f5e">
                    -∞
                  </text>

                  {/* Arrow 3: UP from (-inf) to y2 (CĐ) under [+] */}
                  <line
                    x1="425"
                    y1="190"
                    x2="515"
                    y2="120"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    markerEnd="url(#arr-green-ext)"
                  />

                  {/* Peak at x2: Cực Đại y2 */}
                  <foreignObject x="465" y="94" width="140" height="28" className="overflow-visible pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">
                      <span className="mr-1 text-[11px] font-sans">CĐ:</span>
                      <MathView math={r2.yExact} />
                    </div>
                  </foreignObject>

                  {/* Arrow 4: DOWN from y2 to (-inf) under [-] */}
                  <line
                    x1="555"
                    y1="120"
                    x2="650"
                    y2="190"
                    stroke="#f43f5e"
                    strokeWidth="2.2"
                    markerEnd="url(#arr-red-ext)"
                  />

                  {/* Value at end of right branch: -inf */}
                  <text x="675" y="200" fontSize="13" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400">
                    -∞
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Extrema Summary Cards underneath the table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 bg-amber-50/50 dark:bg-slate-950/80 rounded-xl border border-amber-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <div className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-0.5">
                {isAPositive ? 'Điểm Cực Đại' : 'Điểm Cực Tiểu'} (x₁)
              </div>
              <div className="text-slate-800 dark:text-slate-200 font-mono">
                <MathView math={`x_1 = ${r1.xExact}`} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">Giá trị cực trị</div>
              <div className="text-slate-900 dark:text-white font-mono font-semibold">
                <MathView math={`y_1 = ${r1.yExact}`} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-slate-950/80 rounded-xl border border-indigo-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <div className="font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                {isAPositive ? 'Điểm Cực Tiểu' : 'Điểm Cực Đại'} (x₂)
              </div>
              <div className="text-slate-800 dark:text-slate-200 font-mono">
                <MathView math={`x_2 = ${r2.xExact}`} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">Giá trị cực trị</div>
              <div className="text-slate-900 dark:text-white font-mono font-semibold">
                <MathView math={`y_2 = ${r2.yExact}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div>
            <span className="text-rose-500 dark:text-rose-400 font-bold font-mono">|| :</span> Điểm gián đoạn (tiệm cận đứng <MathView math={`x = ${excludedPointExact}`} />)
          </div>
          <div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">↗ (+) :</span> Đồng biến &nbsp;·&nbsp; <span className="text-rose-600 dark:text-rose-400 font-bold">↘ (-) :</span> Nghịch biến
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: NO EXTREMA (Delta <= 0)
  const isIncreasing = A > 0;
  const x0Clean = cleanForSvg(excludedPointExact);

  return (
    <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ${compact ? 'p-3 sm:p-4' : 'p-5 sm:p-6'} shadow-md space-y-4 transition-colors`}>
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              BẢNG BIẾN THIÊN (Δ ≤ 0 · KHÔNG CÓ CỰC TRỊ)
            </h3>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isIncreasing ? 'Đạo hàm luôn dương y\' > 0' : 'Đạo hàm luôn âm y\' < 0'}
          </div>
        </div>
      )}

      {/* SVG Standard Textbook Variation Table for No Extrema */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[580px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl overflow-hidden p-2">
          <svg viewBox="0 0 600 200" className="w-full h-auto select-none font-serif block">
            <defs>
              <marker
                id="arr-green-noext"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker
                id="arr-red-noext"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Table Horizontal Rule Lines */}
            <line x1="10" y1="8" x2="590" y2="8" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />
            <line x1="10" y1="46" x2="590" y2="46" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />
            <line x1="10" y1="88" x2="590" y2="88" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />
            <line x1="10" y1="194" x2="590" y2="194" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />

            {/* Vertical Rule Line separating Header Labels */}
            <line x1="82" y1="8" x2="82" y2="194" stroke="currentColor" strokeWidth="1.2" className="text-slate-300 dark:text-slate-700" />

            {/* Header Labels */}
            <text x="46" y="32" fontSize="15" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-serif">
              x
            </text>
            <text x="46" y="72" fontSize="15" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-serif">
              y'
            </text>
            <text x="46" y="145" fontSize="15" fontWeight="bold" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-serif">
              y
            </text>

            {/* Row 1: x values */}
            <text x="130" y="31" fontSize="14" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400">
              -∞
            </text>
            {/* x0 at x = 336 */}
            <foreignObject x={266} y={8} width={140} height={34} className="overflow-visible pointer-events-none">
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-rose-500 dark:text-rose-400">
                <MathView math={excludedPointExact} />
              </div>
            </foreignObject>
            <text x="540" y="31" fontSize="14" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400">
              +∞
            </text>

            {/* Double vertical line at x0 = 336 */}
            <line x1="334" y1="46" x2="334" y2="194" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="338" y1="46" x2="338" y2="194" stroke="#f43f5e" strokeWidth="1.5" />

            {/* Row 2: y' signs */}
            {isIncreasing ? (
              <>
                <text x="230" y="73" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#10b981">
                  +
                </text>
                <text x="440" y="73" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#10b981">
                  +
                </text>
              </>
            ) : (
              <>
                <text x="230" y="73" fontSize="22" fontWeight="bold" textAnchor="middle" fill="#f43f5e">
                  -
                </text>
                <text x="440" y="73" fontSize="22" fontWeight="bold" textAnchor="middle" fill="#f43f5e">
                  -
                </text>
              </>
            )}

            {/* Row 3: y arrows */}
            {isIncreasing ? (
              <>
                <text x="130" y="180" fontSize="13" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400">-∞</text>
                <line x1="150" y1="170" x2="300" y2="110" stroke="#10b981" strokeWidth="2.2" markerEnd="url(#arr-green-noext)" />
                <text x="315" y="112" fontSize="13" textAnchor="middle" fill="#f43f5e">+∞</text>

                <text x="355" y="180" fontSize="13" textAnchor="middle" fill="#f43f5e">-∞</text>
                <line x1="375" y1="170" x2="520" y2="110" stroke="#10b981" strokeWidth="2.2" markerEnd="url(#arr-green-noext)" />
                <text x="540" y="112" fontSize="13" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400">+∞</text>
              </>
            ) : (
              <>
                <text x="130" y="112" fontSize="13" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400">+∞</text>
                <line x1="150" y1="120" x2="300" y2="175" stroke="#f43f5e" strokeWidth="2.2" markerEnd="url(#arr-red-noext)" />
                <text x="315" y="180" fontSize="13" textAnchor="middle" fill="#f43f5e">-∞</text>

                <text x="355" y="112" fontSize="13" textAnchor="middle" fill="#f43f5e">+∞</text>
                <line x1="375" y1="120" x2="520" y2="175" stroke="#f43f5e" strokeWidth="2.2" markerEnd="url(#arr-red-noext)" />
                <text x="540" y="180" fontSize="13" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400">-∞</text>
              </>
            )}
          </svg>
        </div>
      </div>

      <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Phương trình <MathView math="y' = 0" /> vô nghiệm hoặc có nghiệm kép (<MathView math="\Delta \le 0" />). Đạo hàm giữ nguyên một dấu trên từng khoảng xác định. Hàm số không có điểm cực trị.
      </div>
    </div>
  );
};
