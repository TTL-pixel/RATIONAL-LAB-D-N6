import React from 'react';
import { RationalAnalysisResult } from '../../types/math';
import { evaluateRational, evaluateDerivative } from '../../math/rationalFunction';
import { MathView } from '../math-ui/MathView';
import { formatDecimal } from '../../math/fraction';
import { Maximize2, TrendingUp, TrendingDown, MinusCircle, AlertCircle, ArrowRight, Target, Sparkles } from 'lucide-react';

interface ExtremaExplorerProps {
  analysis: RationalAnalysisResult;
  probeX: number;
  onProbeXChange: (x: number) => void;
}

export const ExtremaExplorer: React.FC<ExtremaExplorerProps> = ({
  analysis,
  probeX,
  onProbeXChange,
}) => {
  if (!analysis.isValid) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400">
        Hãy thiết lập hàm số hợp lệ để khám phá cực trị.
      </div>
    );
  }

  const { coefficients, extrema, hasExtrema, excludedPoint, extremaLineEquation } = analysis;
  const x0 = excludedPoint;

  const yVal = evaluateRational(probeX, coefficients);
  const slopeVal = evaluateDerivative(probeX, coefficients);

  // Check proximity to extrema
  const nearExtremum = extrema.find((ex) => Math.abs(ex.x - probeX) < 0.15);

  let statusColor = 'text-slate-600 dark:text-slate-400';
  let statusBg = 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800';
  let statusText = 'Bình thường';
  let StatusIcon = MinusCircle;

  if (slopeVal !== null) {
    if (Math.abs(slopeVal) < 0.05) {
      statusColor = 'text-amber-600 dark:text-amber-400';
      statusBg = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/50';
      statusText = "ĐIỂM DỪNG (y' ≈ 0 - Xuất hiện điểm cực trị)";
      StatusIcon = MinusCircle;
    } else if (slopeVal > 0) {
      statusColor = 'text-emerald-600 dark:text-emerald-400';
      statusBg = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/40';
      statusText = "HÀM SỐ ĐANG ĐỒNG BIẾN (y' > 0 - Đồ thị đi lên từ trái sang phải)";
      StatusIcon = TrendingUp;
    } else {
      statusColor = 'text-rose-600 dark:text-rose-400';
      statusBg = 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/40';
      statusText = "HÀM SỐ ĐANG NGHỊCH BIẾN (y' < 0 - Đồ thị đi xuống từ trái sang phải)";
      StatusIcon = TrendingDown;
    }
  }

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-5 transition-colors before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:to-indigo-500 before:rounded-t-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-amber-500" />
            KHÁM PHÁ CỰC TRỊ VÀ SỰ ĐỔI DẤU CỦA ĐẠO HÀM y'
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Di chuyển điểm P dọc theo đồ thị để theo dõi giá trị đạo hàm y' và phát hiện các điểm cực trị
          </p>
        </div>
      </div>

      {/* 11. Visual Hóa Cực Trị Cards: MAXIMUM & MINIMUM */}
      {hasExtrema && (
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>TỌA ĐỘ ĐIỂM CỰC TRỊ TRÊN ĐỒ THỊ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {extrema.map((ex, idx) => {
              const isMax = ex.type === 'max';
              return (
                <div
                  key={idx}
                  onClick={() => onProbeXChange(ex.x)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm hover:shadow-md ${
                    isMax
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/40 hover:border-amber-400'
                      : 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/40 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300">
                      {isMax ? 'CỰC ĐẠI (LOCAL MAXIMUM)' : 'CỰC TIỂU (LOCAL MINIMUM)'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isMax
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isMax ? 'MAXIMUM' : 'MINIMUM'}
                    </span>
                  </div>

                  <div className="py-2 space-y-2.5">
                    {/* Exact point formula */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Tọa độ chính xác dạng giải tích:
                      </div>
                      <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white overflow-x-auto py-0.5">
                        <MathView math={`${isMax ? 'A' : 'B'}\\left(${ex.xExact};\\, ${ex.yExact}\\right)`} />
                      </div>
                    </div>

                    {/* Numeric breakdown & approximations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-sans font-medium">Hoành độ cực trị (x):</div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {ex.xClean || formatDecimal(ex.x, 3)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Số thập phân: {formatDecimal(ex.x, 4)}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-sans font-medium">Tung độ cực trị (y):</div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {ex.yClean || formatDecimal(ex.y, 3)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Số thập phân: {formatDecimal(ex.y, 4)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-sans">Điểm dừng:</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                          y'({formatDecimal(ex.x, 2)}) = 0
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                        {isMax ? 'Đổi dấu: (+) sang (-)' : 'Đổi dấu: (-) sang (+)'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span>Nhấp để nhảy tọa độ P đến điểm này</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {extremaLineEquation && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs flex items-center justify-between">
              <div>
                <strong>Đường thẳng nối hai cực trị:</strong> <MathView math={extremaLineEquation} />
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 hidden sm:inline">
                y = (2ax + b) / p
              </span>
            </div>
          )}
        </div>
      )}

      {/* Slider for Probe X */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Chọn hoành độ x để khảo sát:
          </span>
          <span className="font-mono text-sm font-bold text-blue-600 dark:text-cyan-400">
            x = {formatDecimal(probeX, 2)}
          </span>
        </div>

        <input
          type="range"
          min={x0 - 8}
          max={x0 + 8}
          step="0.05"
          value={probeX}
          onChange={(e) => {
            const next = parseFloat(e.target.value);
            if (Math.abs(next - x0) < 0.1) {
              onProbeXChange(next > x0 ? x0 + 0.15 : x0 - 0.15);
            } else {
              onProbeXChange(next);
            }
          }}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-400"
        />

        {/* Quick jump to extrema buttons */}
        {hasExtrema && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Nhảy nhanh đến cực trị:</span>
            {extrema.map((ex, i) => (
              <button
                key={i}
                onClick={() => onProbeXChange(ex.x)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              >
                {ex.type === 'max' ? 'Cực đại' : 'Cực tiểu'} x = {ex.xClean || formatDecimal(ex.x, 2)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real-time State Card */}
      <div className={`p-4 rounded-xl border ${statusBg} space-y-3 transition-colors`}>
        <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <StatusIcon className={`w-5 h-5 ${statusColor}`} />
          <span className={statusColor}>{statusText}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 mb-0.5 flex items-center justify-between">
              <span>Điểm khảo sát P</span>
              <span className="text-[10px] text-amber-600 dark:text-yellow-400 font-sans">Trên đồ thị</span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-yellow-300 break-words">
              {yVal !== null ? `P(${formatDecimal(probeX, 2)}; ${formatDecimal(yVal, 2)})` : 'Không xác định'}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 mb-0.5 flex items-center justify-between">
              <span>Điểm đối xứng P'</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-sans">Đối xứng qua I</span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-amber-300 break-words">
              {(() => {
                if (yVal === null) return 'Không xác định';
                const pPrimeX = 2 * analysis.symmetryCenter.x - probeX;
                const pPrimeY = 2 * analysis.symmetryCenter.y - yVal;
                return `P'(${formatDecimal(pPrimeX, 2)}; ${formatDecimal(pPrimeY, 2)})`;
              })()}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 mb-0.5">Giá trị đạo hàm y'(x)</div>
            <div className={`font-mono text-xs sm:text-sm font-bold break-words ${statusColor}`}>
              {slopeVal !== null ? formatDecimal(slopeVal, 3) : 'Không xác định'}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 mb-0.5">Trạng thái đạo hàm</div>
            <div className="font-mono text-xs font-bold break-words">
              {slopeVal !== null ? (
                Math.abs(slopeVal) < 0.05 ? (
                  <span className="text-amber-600 dark:text-amber-400">y' = 0 (Điểm dừng)</span>
                ) : slopeVal > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">y' &gt; 0 (Đồng biến)</span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">y' &lt; 0 (Nghịch biến)</span>
                )
              ) : (
                <span className="text-slate-400">Không xác định</span>
              )}
            </div>
          </div>
        </div>

        {nearExtremum && (
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Phát hiện điểm {nearExtremum.type === 'max' ? 'Cực đại' : 'Cực tiểu'}!</strong> Tại đây đạo hàm bằng 0 (<MathView math="y' = 0" />) và đạo hàm đổi dấu khi <MathView math="x" /> đi qua điểm này.
            </div>
          </div>
        )}
      </div>

      {/* Theory Summary */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <div className="font-bold text-slate-900 dark:text-slate-200">Quy tắc vàng về Cực trị &amp; Tính chất Đối xứng trong Giải tích 12:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500 dark:text-slate-400">
          <div>• <span className="text-emerald-600 dark:text-emerald-400 font-semibold">y' &gt; 0:</span> Hàm số đồng biến (đồ thị đi lên từ trái sang phải).</div>
          <div>• <span className="text-rose-600 dark:text-rose-400 font-semibold">y' &lt; 0:</span> Hàm số nghịch biến (đồ thị đi xuống từ trái sang phải).</div>
          <div>• <span className="text-amber-600 dark:text-amber-400 font-semibold">y' đổi dấu (+) sang (-):</span> Điểm cực đại (đỉnh nhô lên).</div>
          <div>• <span className="text-indigo-600 dark:text-indigo-400 font-semibold">y' đổi dấu (-) sang (+):</span> Điểm cực tiểu (đáy trũng xuống).</div>
          <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300">
            • <span className="font-bold">Cặp điểm đối xứng P &amp; P':</span> Với mọi điểm <MathView math="P(x_P; y_P)" /> trên đồ thị, điểm đối xứng <MathView math="P'(2x_I - x_P; 2y_I - y_P)" /> qua tâm đối xứng <MathView math="I(x_I; y_I)" /> luôn thuộc đồ thị hàm số (<MathView math="I" /> là trung điểm đoạn thẳng <MathView math="PP'" />). Hệ số góc tiếp tuyến tại hai điểm luôn bằng nhau: <MathView math="y'(x_P) = y'(x_{P'})" />.
          </div>
        </div>
      </div>
    </div>
  );
};
