import React, { useState } from 'react';
import { RationalAnalysisResult } from '../../types/math';
import { MathView, MathText } from './MathView';
import { VariationTable } from './VariationTable';
import { formatQuadratic, formatLinear } from '../../math/fraction';
import { 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  Compass, 
  Activity, 
  Maximize2, 
  Split, 
  Target, 
  BookOpen,
  LineChart,
  Table,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Crosshair
} from 'lucide-react';

interface StepByStepAnalysisProps {
  analysis: RationalAnalysisResult;
}

export const StepByStepAnalysis: React.FC<StepByStepAnalysisProps> = ({ analysis }) => {
  const [openAll, setOpenAll] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false,
  });

  const toggleStep = (step: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  const handleToggleAll = () => {
    const nextState = !openAll;
    setOpenAll(nextState);
    const updated: Record<number, boolean> = {};
    for (let i = 1; i <= 12; i++) {
      updated[i] = nextState;
    }
    setExpandedSteps(updated);
  };

  if (!analysis.isValid) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400">
        Vui lòng điều chỉnh hệ số để xem phân tích khảo sát hàm số chi tiết.
      </div>
    );
  }

  const {
    coefficients,
    domainLatex,
    excludedPointExact,
    derivative,
    extrema,
    hasExtrema,
    extremaLineEquation,
    increasingIntervals,
    decreasingIntervals,
    limits,
    asymptotes,
    symmetryCenter,
    intercepts,
  } = analysis;

  const steps = [
    {
      num: '01',
      id: 1,
      icon: BookOpen,
      title: 'Tập xác định & Điều kiện',
      badge: 'Điều kiện mẫu số ≠ 0',
      preview: domainLatex,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div>
            Điều kiện để biểu thức mẫu số có nghĩa:{' '}
            <MathView math={`${formatLinear(coefficients.p, coefficients.q)} \\neq 0 \\iff x \\neq ${excludedPointExact}`} />.
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-blue-600 dark:text-cyan-300">
            Tập xác định: <MathView math={domainLatex} />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            💡 <em>Bản chất hình học:</em> Điểm làm mẫu số bằng 0 làm gián đoạn tập xác định và sinh ra đường tiệm cận đứng <MathView math={`x = ${excludedPointExact}`} />.
          </div>
        </div>
      ),
    },
    {
      num: '02',
      id: 2,
      icon: Calculator,
      title: "Đạo hàm bậc nhất y'",
      badge: 'Công thức u/v',
      preview: derivative.simplifiedLatex,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div>
            Áp dụng quy tắc đạo hàm hàm phân thức <MathView math="\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}" />:
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto text-center font-serif">
            <MathView math={derivative.formulaLatex} block />
          </div>
          <div>
            Khai triển và rút gọn tử thức: <MathView math={`u'v - uv' = ${formatQuadratic(derivative.A, derivative.B, derivative.C)}`} />.
          </div>
        </div>
      ),
    },
    {
      num: '03',
      id: 3,
      icon: Activity,
      title: "Nghiệm phương trình y' = 0",
      badge: 'Giải tử số',
      preview: hasExtrema
        ? `2 nghiệm: x₁ ≈ ${derivative.roots[0].toFixed(2)}, x₂ ≈ ${derivative.roots[1].toFixed(2)}`
        : (Math.abs(derivative.delta) <= 1e-9 ? `Nghiệm kép: x = ${derivative.rootsLatex[0] || derivative.roots[0]?.toFixed(2)}` : 'Vô nghiệm (Δ < 0)'),
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div>
            Phương trình <MathView math="y' = 0 \iff" /> Tử thức bằng 0:
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-serif text-base font-bold text-slate-900 dark:text-white">
            <MathView math={`${formatQuadratic(derivative.A, derivative.B, derivative.C)} = 0`} />
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs">
            Biệt thức <MathView math="\Delta = B^2 - 4AC" />: <MathView math={`\\Delta = (${derivative.B})^2 - 4(${derivative.A})(${derivative.C}) = ${Math.round(derivative.delta)}`} />.
          </div>
          {hasExtrema ? (
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold space-y-1">
              Vì <MathView math="\Delta > 0" />, phương trình có 2 nghiệm phân biệt:
              <div className="font-mono text-xs pl-2 space-y-1">
                <div>• <MathView math={`x_1 = ${derivative.rootsLatex[0] || derivative.roots[0].toFixed(2)} \\approx ${derivative.roots[0].toFixed(2)}`} /></div>
                <div>• <MathView math={`x_2 = ${derivative.rootsLatex[1] || derivative.roots[1].toFixed(2)} \\approx ${derivative.roots[1].toFixed(2)}`} /></div>
              </div>
            </div>
          ) : (
            <div className="text-amber-600 dark:text-amber-400 font-semibold">
              {Math.abs(derivative.delta) <= 1e-9 ? (
                <span>Vì <MathView math="\Delta = 0" />, phương trình có nghiệm kép <MathView math={`x = ${derivative.rootsLatex[0]}`} />. Tử số không đổi dấu.</span>
              ) : (
                <span>Vì <MathView math="\Delta < 0" />, phương trình vô nghiệm. Tử số cùng dấu với hệ số A trên toàn tập xác định.</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      num: '04',
      id: 4,
      icon: TrendingUp,
      title: "Xét dấu đạo hàm y'",
      badge: 'Quy tắc tam thức',
      preview: derivative.A > 0 ? 'Trong trái (-), ngoài cùng (+) (A > 0)' : 'Trong trái (+), ngoài cùng (-) (A < 0)',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div>
            Dấu của <MathView math="y'" /> phụ thuộc hoàn toàn vào dấu của tam thức bậc hai ở tử số (vì mẫu số <MathView math="(px+q)^2 > 0" /> với mọi <MathView math={`x \\neq ${excludedPointExact}`} />).
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div>• Hệ số <MathView math={`A = a \\cdot p = ${derivative.A}`} /> ({derivative.A > 0 ? 'dương > 0' : 'âm < 0'}).</div>
            {hasExtrema ? (
              <>
                <div>• <strong>Trong khoảng 2 nghiệm:</strong> <MathView math={`(${derivative.rootsLatex[0]};\\, ${derivative.rootsLatex[1]})`} />, đạo hàm <MathView math="y'" /> mang dấu trái với A: <strong className={derivative.A > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{derivative.A > 0 ? 'y\' < 0 (Nghịch biến)' : 'y\' > 0 (Đồng biến)'}</strong>.</div>
                <div>• <strong>Ngoài khoảng 2 nghiệm:</strong> <MathView math={`(-\\infty;\\, ${derivative.rootsLatex[0]})`} /> và <MathView math={`(${derivative.rootsLatex[1]};\\, +\\infty)`} />, đạo hàm <MathView math="y'" /> mang dấu cùng với A: <strong className={derivative.A > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{derivative.A > 0 ? 'y\' > 0 (Đồng biến)' : 'y\' < 0 (Nghịch biến)'}</strong>.</div>
              </>
            ) : (
              <div>• Vì <MathView math="\Delta \le 0" />, đạo hàm <MathView math="y'" /> luôn mang dấu cùng với A: <strong className={derivative.A > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{derivative.A > 0 ? 'y\' > 0 trên từng khoảng xác định' : 'y\' < 0 trên từng khoảng xác định'}</strong>.</div>
            )}
          </div>
        </div>
      ),
    },
    {
      num: '05',
      id: 5,
      icon: Compass,
      title: 'Khoảng đồng biến & nghịch biến',
      badge: 'Chiều biến thiên',
      preview: increasingIntervals.length > 0 ? `ĐB: ${increasingIntervals[0]}` : 'Nghịch biến trên từng khoảng',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {increasingIntervals.length > 0 && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs">
              <strong>Hàm số đồng biến trên các khoảng:</strong>{' '}
              <span className="font-mono">{increasingIntervals.map((inv, idx) => (
                <span key={idx}><MathView math={inv} />{idx < increasingIntervals.length - 1 ? ' và ' : ''}</span>
              ))}</span>
            </div>
          )}
          {decreasingIntervals.length > 0 && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
              <strong>Hàm số nghịch biến trên các khoảng:</strong>{' '}
              <span className="font-mono">{decreasingIntervals.map((inv, idx) => (
                <span key={idx}><MathView math={inv} />{idx < decreasingIntervals.length - 1 ? ' và ' : ''}</span>
              ))}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      num: '06',
      id: 6,
      icon: Maximize2,
      title: 'Điểm cực đại & Cực tiểu',
      badge: hasExtrema ? '2 Điểm cực trị' : 'Không có cực trị',
      preview: hasExtrema
        ? `${extrema[0]?.type === 'max' ? 'CĐ' : 'CT'}(${extrema[0]?.x.toFixed(1)}; ${extrema[0]?.y.toFixed(1)}), ${extrema[1]?.type === 'max' ? 'CĐ' : 'CT'}(${extrema[1]?.x.toFixed(1)}; ${extrema[1]?.y.toFixed(1)})`
        : 'Không có cực trị',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {hasExtrema ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {extrema.map((ex, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border ${
                    ex.type === 'max'
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-200'
                      : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-2">
                    <span>{ex.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-white/70 dark:bg-slate-900/70 border border-current/20">
                      {ex.type === 'max' ? 'CỰC ĐẠI' : 'CỰC TIỂU'}
                    </span>
                  </div>
                  <div className="space-y-1 font-mono">
                    <div>• Hoành độ: <MathView math={`x = ${ex.xExact}`} /> <span className="text-slate-400 font-sans">(≈ {ex.x.toFixed(2)})</span></div>
                    <div>• Tung độ: <MathView math={`y = ${ex.yExact}`} /> <span className="text-slate-400 font-sans">(≈ {ex.y.toFixed(2)})</span></div>
                    <div>• Tọa độ điểm: <MathView math={`${ex.type === 'max' ? 'A' : 'B'}\\left(${ex.xExact};\\, ${ex.yExact}\\right)`} /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-500 dark:text-slate-400">
              Đạo hàm không đổi dấu, do đó hàm số không có điểm cực trị.
            </div>
          )}

          {hasExtrema && extremaLineEquation && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs">
              <strong>Đường thẳng đi qua 2 điểm cực trị:</strong> <MathView math={extremaLineEquation} />
              <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
                (Áp dụng công thức SGK: <MathView math="y = \frac{u'(x)}{v'(x)} = \frac{2ax+b}{p}" />)
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      num: '07',
      id: 7,
      icon: Sparkles,
      title: 'Giới hạn tại vô cực & Giới hạn một bên',
      badge: 'Hành vi tiệm cận',
      preview: `x → +∞: ${limits.posInf}, x → -∞: ${limits.negInf}`,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Tại vô cực:</span>
              <div className="mt-1 space-y-1 font-mono">
                <div>• <MathView math={`\\lim\\limits_{x \\to +\\infty} y = ${limits.posInf}`} /></div>
                <div>• <MathView math={`\\lim\\limits_{x \\to -\\infty} y = ${limits.negInf}`} /></div>
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Một bên điểm gián đoạn ({excludedPointExact}):</span>
              <div className="mt-1 space-y-1 font-mono">
                <div>• <MathView math={`\\lim\\limits_{x \\to \\left(${excludedPointExact}\\right)^+} y = ${limits.vertRight}`} /></div>
                <div>• <MathView math={`\\lim\\limits_{x \\to \\left(${excludedPointExact}\\right)^-} y = ${limits.vertLeft}`} /></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '08',
      id: 8,
      icon: Split,
      title: 'Đường tiệm cận đứng & Tiệm cận xiên',
      badge: 'TCĐ & TCX',
      preview: `${asymptotes.vertical.equation} · ${asymptotes.oblique.equation}`,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300">
            <strong>Tiệm cận đứng:</strong> <MathView math={asymptotes.vertical.equation} />
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              (Nghiệm của mẫu số làm mẫu số bằng 0 nhưng tử số khác 0).
            </p>
          </div>

          <div className="p-3 bg-sky-50 dark:bg-sky-950/20 rounded-xl border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300">
            <strong>Tiệm cận xiên:</strong> <MathView math={asymptotes.oblique.equation} />
            <div className="mt-1 text-xs">
              Thực hiện phép chia đa thức tử cho mẫu:
              <div className="p-2 bg-white/70 dark:bg-slate-950/80 rounded border border-sky-200 dark:border-sky-900/60 my-1 text-center font-serif text-sm">
                <MathView math={asymptotes.oblique.divisionStepsLatex} />
              </div>
              Khi <MathView math="x \\to \\pm\\infty" />, phần dư tiến về 0, đồ thị ép sát đường thẳng <MathView math={asymptotes.oblique.equation} />.
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '09',
      id: 9,
      icon: Target,
      title: "Tâm đối xứng I & Cặp điểm P - P'",
      badge: 'Giao 2 tiệm cận',
      preview: `Tâm I(${symmetryCenter.exactX}; ${symmetryCenter.exactY})`,
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-xl border border-pink-200 dark:border-pink-500/30 text-pink-700 dark:text-pink-300">
            <strong>Tọa độ Tâm đối xứng:</strong> <MathView math={symmetryCenter.latex} />
            <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">
              Giao điểm của tiệm cận đứng và tiệm cận xiên: <MathView math={`x_I = ${symmetryCenter.exactX}, \\quad y_I = ${symmetryCenter.exactY}`} />.
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
            <strong>Đặc tính cặp điểm P và P':</strong> Với mọi điểm <MathView math="P(x_P; y_P)" /> trên đồ thị, điểm đối xứng <MathView math="P'(2x_I - x_P; 2y_I - y_P)" /> qua tâm I cũng thuộc đồ thị hàm số. Tâm I luôn là trung điểm của đoạn nối <MathView math="PP'" />.
          </div>
        </div>
      ),
    },
    {
      num: '10',
      id: 10,
      icon: Crosshair,
      title: 'Giao điểm với các trục tọa độ Ox, Oy',
      badge: 'Tọa độ giao điểm',
      preview: intercepts.oy ? `Oy: (0; ${intercepts.oy.exactY || intercepts.oy.y.toFixed(1)})` : 'Không giao Oy',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Giao trục Oy (x = 0):</span>
              <div className="mt-1">
                {intercepts.oy ? (
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    <MathView math={`\\left(0;\\, ${intercepts.oy.exactY || intercepts.oy.y.toFixed(2)}\\right)`} />
                  </span>
                ) : (
                  <span className="text-slate-400">Không cắt trục Oy (x = 0 không thuộc TXĐ).</span>
                )}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Giao trục Ox (y = 0):</span>
              <div className="mt-1">
                {intercepts.ox.length > 0 ? (
                  <div className="space-y-1 font-mono text-emerald-600 dark:text-emerald-400">
                    {intercepts.ox.map((pt, i) => (
                      <div key={i}>• <MathView math={`\\left(${pt.exactX || pt.x.toFixed(2)};\\, 0\\right)`} /></div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">Không cắt trục Ox (phương trình tử số vô nghiệm).</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '11',
      id: 11,
      icon: Table,
      title: 'Bảng biến thiên chuẩn SGK',
      badge: 'Tổng hợp dấu & chiều',
      preview: 'Đầy đủ hàng x, y\', y và tiệm cận',
      content: (
        <div className="space-y-3 pt-1">
          <VariationTable analysis={analysis} compact />
        </div>
      ),
    },
    {
      num: '12',
      id: 12,
      icon: LineChart,
      title: 'Đồ thị và Tổng kết hình dạng',
      badge: 'Đường cong hypebol xiên',
      preview: '2 nhánh phân cách bởi TCĐ',
      content: (
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
          <div>• Đồ thị hàm số gồm 2 nhánh phân cách bởi đường tiệm cận đứng <MathView math={asymptotes.vertical.equation} />.</div>
          <div>• Hai nhánh cùng uốn quanh đường tiệm cận xiên <MathView math={asymptotes.oblique.equation} />.</div>
          <div>• Đồ thị nhận giao điểm hai đường tiệm cận <MathView math={symmetryCenter.latex} /> làm tâm đối xứng.</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400"></span>
            12 BƯỚC KHẢO SÁT HÀM SỐ TOÀN DIỆN (CHUẨN BỘ GIÁO DỤC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quy trình khảo sát giải tích chuẩn mực từng bước theo phân phối chương trình Toán 12
          </p>
        </div>

        <button
          onClick={handleToggleAll}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        >
          {openAll ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
        </button>
      </div>

      {/* 12 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {steps.map((s) => {
          const Icon = s.icon;
          const isExpanded = !!expandedSteps[s.id];

          return (
            <div
              key={s.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-white dark:bg-slate-900 border-blue-500/40 dark:border-cyan-500/40 shadow-md'
                  : 'bg-white/90 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Header Bar */}
              <div
                onClick={() => toggleStep(s.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none gap-3"
              >
                <div className="flex items-center gap-3">
                  {/* Step Number Circle */}
                  <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-900/60 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {s.num}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {s.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans hidden sm:inline">
                        · {s.badge}
                      </span>
                    </div>
                    {/* Preview Result */}
                    {!isExpanded && s.preview && (
                      <div className="text-xs text-blue-600 dark:text-cyan-400 font-medium truncate max-w-[280px] sm:max-w-xs mt-0.5">
                        <MathText text={s.preview} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
                    {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                  </span>
                  <div className="text-slate-400 dark:text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 animate-fadeIn">
                  {s.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
