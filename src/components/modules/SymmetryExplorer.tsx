import React from 'react';
import { RationalAnalysisResult } from '../../types/math';
import { evaluateRational } from '../../math/rationalFunction';
import { MathView } from '../math-ui/MathView';
import { formatDecimal } from '../../math/fraction';
import { Target, CheckCircle2, ArrowRightLeft, Sparkles, Check } from 'lucide-react';

interface SymmetryExplorerProps {
  analysis: RationalAnalysisResult;
  onProbeXChange: (x: number) => void;
  probeX: number;
}

export const SymmetryExplorer: React.FC<SymmetryExplorerProps> = ({
  analysis,
  onProbeXChange,
  probeX,
}) => {
  if (!analysis.isValid) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400">
        Hãy thiết lập hàm số hợp lệ để khám phá tâm đối xứng.
      </div>
    );
  }

  const { symmetryCenter, coefficients, asymptotes } = analysis;
  const xI = symmetryCenter.x;
  const yI = symmetryCenter.y;

  // Point P on graph
  const xP = probeX;
  const yP = evaluateRational(xP, coefficients);

  // Symmetric point P'
  const xPPrime = 2 * xI - xP;
  const yPPrimeCalculated = yP !== null ? 2 * yI - yP : null;
  const yPPrimeActual = evaluateRational(xPPrime, coefficients);

  // Distance IP and IP'
  const distIP = yP !== null ? Math.sqrt((xP - xI) ** 2 + (yP - yI) ** 2) : 0;
  const distIPPrime = yPPrimeActual !== null ? Math.sqrt((xPPrime - xI) ** 2 + (yPPrimeActual - yI) ** 2) : 0;
  const isMatch = Math.abs(distIP - distIPPrime) < 1e-4;

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-6 transition-colors before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-cyan-400 before:rounded-t-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-500" />
            BẢN CHẤT HÌNH HỌC TÂM ĐỐI XỨNG &amp; CẶP ĐIỂM P - P'
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Giao điểm 2 đường tiệm cận là tâm đối xứng của đường cong: I là trung điểm của đoạn nối PP'
          </p>
        </div>
      </div>

      {/* 12. SPECIAL CARD: TÂM ĐỐI XỨNG WITH MINI VISUALIZATION */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 via-slate-50 dark:via-slate-950 to-blue-500/10 border border-pink-200 dark:border-pink-500/30 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-500/30 text-pink-700 dark:text-pink-300 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              TÂM ĐỐI XỨNG CỦA ĐỒ THỊ HÀM SỐ
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif flex items-center gap-3">
                <span>●</span>
                <span className="text-pink-600 dark:text-pink-400">
                  <MathView math={`I\\left(${symmetryCenter.exactX};\\, ${symmetryCenter.exactY}\\right)`} />
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Tọa độ xấp xỉ: I({xI.toFixed(2)}; {yI.toFixed(2)})
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Tâm đối xứng <strong>I</strong> chính là giao điểm duy nhất của <strong>tiệm cận đứng</strong> <MathView math={asymptotes.vertical.equation} /> và <strong>tiệm cận xiên</strong> <MathView math={asymptotes.oblique.equation} />.
            </p>

            <div className="pt-1 flex flex-wrap gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Hoành độ:</span>{' '}
                <strong className="text-blue-600 dark:text-cyan-400 font-mono">
                  <MathView math={`x_I = -\\frac{q}{p} = ${symmetryCenter.exactX}`} />
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Tung độ:</span>{' '}
                <strong className="text-pink-600 dark:text-pink-400 font-mono">
                  <MathView math={`y_I = m \\cdot x_I + n = ${symmetryCenter.exactY}`} />
                </strong>
              </div>
            </div>
          </div>

          {/* Mini Interactive Visualization */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-[260px] aspect-square rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-2 shadow-inner relative flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full select-none">
                {/* Asymptotes crossing */}
                <line x1="100" y1="15" x2="100" y2="185" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="3 2" />
                <line x1="15" y1="170" x2="185" y2="30" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />

                {/* Hyperbolic Curves */}
                <path d="M 25 175 Q 60 125 90 185" fill="none" stroke="#0284c7" className="dark:stroke-cyan-400" strokeWidth="2" />
                <path d="M 110 15 Q 140 75 175 25" fill="none" stroke="#0284c7" className="dark:stroke-cyan-400" strokeWidth="2" />

                {/* Segment PP' connecting points through I */}
                <line x1="55" y1="138" x2="145" y2="62" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 2" />

                {/* Point P */}
                <circle cx="55" cy="138" r="3.5" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                <text x="40" y="136" fontSize="8" fontWeight="bold" fill="#ca8a04" className="dark:fill-yellow-300 font-mono">P</text>

                {/* Point P' */}
                <circle cx="145" cy="62" r="3.5" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                <text x="152" y="65" fontSize="8" fontWeight="bold" fill="#ca8a04" className="dark:fill-yellow-300 font-mono">P'</text>

                {/* Center I (Pulsing Glow) */}
                <circle cx="100" cy="100" r="12" fill="#f472b6" fillOpacity="0.3" className="animate-pulseGlow" />
                <circle cx="100" cy="100" r="4.5" fill="#db2777" stroke="#ffffff" strokeWidth="1.5" />
                <text x="108" y="96" fontSize="9" fontWeight="bold" fill="#db2777" className="dark:fill-pink-400 font-mono">I</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Box: P và P' là gì? */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-2 leading-relaxed">
        <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          P và P' là gì? Ý nghĩa trong chương trình Giải tích lớp 12:
        </div>
        <div className="text-slate-600 dark:text-slate-300 space-y-1.5">
          <div>
            • <strong className="text-amber-700 dark:text-yellow-400">Điểm P(x; y):</strong> Là một điểm bất kỳ đang nằm trên đồ thị hàm số.
          </div>
          <div>
            • <strong className="text-amber-700 dark:text-amber-400">Điểm đối xứng P'(x'; y'):</strong> Là điểm đối xứng với P qua tâm đối xứng <strong className="text-pink-600 dark:text-pink-400">I</strong> với công thức <MathView math="x_{P'} = 2x_I - x_P" /> và <MathView math="y_{P'} = 2y_I - y_P" />.
          </div>
          <div>
            • <strong className="text-slate-900 dark:text-white">Đặc tính đối xứng:</strong> Vì I là tâm đối xứng, khi P thuộc đồ thị thì <strong className="text-emerald-600 dark:text-emerald-400">P' cũng chắc chắn luôn thuộc đồ thị</strong> (nằm ở nhánh đối diện) và <strong className="text-slate-900 dark:text-white">I luôn là trung điểm của đoạn nối PP'</strong>. Bạn có thể bật/tắt hiển thị cặp điểm này trong mục <em>Lớp hiển thị trên đồ thị</em>.
          </div>
        </div>
      </div>

      {/* Slider for Point P */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Di chuyển hoành độ điểm P (<MathView math="x_P" />):
          </span>
          <span className="font-mono text-sm font-bold text-amber-600 dark:text-yellow-400">
            x = {formatDecimal(xP, 2)}
          </span>
        </div>

        <input
          type="range"
          min={xI - 8}
          max={xI + 8}
          step="0.05"
          value={xP}
          onChange={(e) => {
            const next = parseFloat(e.target.value);
            if (Math.abs(next - xI) < 0.1) {
              onProbeXChange(next > xI ? xI + 0.15 : xI - 0.15);
            } else {
              onProbeXChange(next);
            }
          }}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Comparison Grid for P, I, and P' */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Point P Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
          <div className="font-bold text-amber-600 dark:text-yellow-400 flex items-center justify-between">
            <span>ĐIỂM P (TRÊN ĐỒ THỊ)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-yellow-400 font-mono">Nhánh 1</span>
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
            {yP !== null ? `P(${formatDecimal(xP, 2)}; ${formatDecimal(yP, 2)})` : 'Không xác định'}
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Khoảng cách đến tâm I: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{formatDecimal(distIP, 3)}</span>
          </div>
        </div>

        {/* Center I Card */}
        <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-500/40 space-y-1.5 shadow-sm">
          <div className="font-bold text-pink-600 dark:text-pink-400 flex items-center justify-between">
            <span>TÂM ĐỐI XỨNG I</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/15 text-pink-600 dark:text-pink-400 font-mono">Trung điểm PP'</span>
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
            <MathView math={`I\\left(${symmetryCenter.exactX};\\, ${symmetryCenter.exactY}\\right)`} />
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Giao điểm tiệm cận: <MathView math={`${asymptotes.vertical.equation} \\cap ${asymptotes.oblique.equation}`} />
          </div>
        </div>

        {/* Point P' Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
          <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>ĐIỂM ĐỐI XỨNG P'</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">Nhánh 2</span>
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
            {yPPrimeActual !== null ? `P'(${formatDecimal(xPPrime, 2)}; ${formatDecimal(yPPrimeActual, 2)})` : 'Không xác định'}
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Khoảng cách đến tâm I: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{formatDecimal(distIPPrime, 3)}</span>
          </div>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <strong>Kiểm chứng giải tích:</strong> Khoảng cách IP = IP' ({formatDecimal(distIP, 3)} = {formatDecimal(distIPPrime, 3)}). Điểm P' luôn thuộc đồ thị hàm số và I là trung điểm chính xác của đoạn thẳng PP'.
        </div>
      </div>
    </div>
  );
};
