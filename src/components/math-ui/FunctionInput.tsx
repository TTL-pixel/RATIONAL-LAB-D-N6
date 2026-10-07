import React, { useState, useEffect } from 'react';
import { FunctionCoefficients } from '../../types/math';
import { MathView } from './MathView';
import { formatQuadratic, formatLinear, formatFraction } from '../../math/fraction';
import { 
  Minus, 
  Plus, 
  RotateCcw, 
  Dices, 
  Sparkles, 
  AlertTriangle, 
  Layers, 
  Check, 
  ArrowRight
} from 'lucide-react';

interface FunctionInputProps {
  coefficients: FunctionCoefficients;
  onChange: (coeffs: FunctionCoefficients) => void;
  isValid: boolean;
  validationError?: string;
}

const PRESETS: { label: string; formulaLatex: string; coeffs: FunctionCoefficients; desc: string; tag: string }[] = [
  {
    label: 'Hàm chuẩn SGK 12',
    formulaLatex: 'y = \\frac{x^2 + 2x + 3}{x - 1}',
    coeffs: { a: 1, b: 2, c: 3, p: 1, q: -1 },
    desc: 'TCĐ x = 1, TCX y = x + 3, Tâm I(1; 4)',
    tag: 'Chuẩn SGK',
  },
  {
    label: 'Cực trị nguyên đẹp',
    formulaLatex: 'y = \\frac{x^2 + x + 2}{x - 1}',
    coeffs: { a: 1, b: 1, c: 2, p: 1, q: -1 },
    desc: 'Hai điểm cực trị có tọa độ nguyên đẹp: A(0; -2) và B(2; 8)',
    tag: 'Cực trị đẹp',
  },
  {
    label: 'Hệ số âm a = -1',
    formulaLatex: 'y = \\frac{-x^2 + 3x - 3}{x - 1}',
    coeffs: { a: -1, b: 3, c: -3, p: 1, q: -1 },
    desc: 'Hệ số âm a = -1: Cực tiểu trước (0; 3), Cực đại sau (2; -1)',
    tag: 'Hệ số a < 0',
  },
  {
    label: 'Mẫu số x + 2',
    formulaLatex: 'y = \\frac{2x^2 - 3x + 1}{x + 2}',
    coeffs: { a: 2, b: -3, c: 1, p: 1, q: 2 },
    desc: 'Mẫu x + 2: TCĐ x = -2, TCX y = 2x - 7, Tâm I(-2; -11)',
    tag: 'Mẫu x + 2',
  },
  {
    label: 'Không có cực trị',
    formulaLatex: 'y = \\frac{x^2 - x + 1}{x + 1}',
    coeffs: { a: 1, b: -1, c: 1, p: 1, q: 1 },
    desc: 'Đạo hàm không có nghiệm (Δ ≤ 0): Hàm số luôn đồng biến trên TXĐ',
    tag: 'Không cực trị',
  },
  {
    label: 'Tâm đối xứng trên Ox',
    formulaLatex: 'y = \\frac{x^2 - 2x + 2}{x - 1}',
    coeffs: { a: 1, b: -2, c: 2, p: 1, q: -1 },
    desc: 'Cực trị đối xứng qua tâm I(1; 0): A(0; -2) và B(2; 2)',
    tag: 'Tâm trên Ox',
  },
];

export const FunctionInput: React.FC<FunctionInputProps> = ({
  coefficients,
  onChange,
  isValid,
  validationError,
}) => {
  // String buffer for smooth numeric text typing (allows typing negative numbers '-' and backspacing)
  const [inputStrings, setInputStrings] = useState<Record<string, string>>({
    a: String(coefficients.a),
    b: String(coefficients.b),
    c: String(coefficients.c),
    p: String(coefficients.p),
    q: String(coefficients.q),
  });

  // Active tab/mode: 'visual' or 'presets'
  const [activeTab, setActiveTab] = useState<'input' | 'presets'>('input');

  // Keep string buffers in sync when external props change
  useEffect(() => {
    setInputStrings({
      a: String(coefficients.a),
      b: String(coefficients.b),
      c: String(coefficients.c),
      p: String(coefficients.p),
      q: String(coefficients.q),
    });
  }, [coefficients.a, coefficients.b, coefficients.c, coefficients.p, coefficients.q]);

  const handleUpdate = (key: keyof FunctionCoefficients, value: number) => {
    onChange({
      ...coefficients,
      [key]: value,
    });
  };

  const handleInputChange = (key: keyof FunctionCoefficients, raw: string) => {
    setInputStrings((prev) => ({ ...prev, [key]: raw }));
    if (raw === '' || raw === '-') return;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      handleUpdate(key, parsed);
    }
  };

  const handleInputBlur = (key: keyof FunctionCoefficients) => {
    const raw = inputStrings[key];
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || ((key === 'a' || key === 'p') && parsed === 0)) {
      const fallback = (key === 'a' || key === 'p') ? (coefficients[key] || 1) : (coefficients[key] || 0);
      handleUpdate(key, fallback);
      setInputStrings((prev) => ({ ...prev, [key]: String(fallback) }));
    } else {
      handleUpdate(key, parsed);
      setInputStrings((prev) => ({ ...prev, [key]: String(parsed) }));
    }
  };

  const handleStep = (key: keyof FunctionCoefficients, delta: number) => {
    const current = coefficients[key];
    let next = current + delta;
    if ((key === 'a' || key === 'p') && next === 0) {
      next = delta > 0 ? 1 : -1;
    }
    handleUpdate(key, next);
    setInputStrings((prev) => ({ ...prev, [key]: String(next) }));
  };

  const handleQuickSet = (key: keyof FunctionCoefficients, value: number) => {
    handleUpdate(key, value);
    setInputStrings((prev) => ({ ...prev, [key]: String(value) }));
  };

  const handleReset = () => {
    onChange({ a: 1, b: 2, c: 3, p: 1, q: -1 });
  };

  const handleRandom = () => {
    let newCoeffs: FunctionCoefficients;
    let attempts = 0;
    do {
      attempts++;
      const a = (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.3 ? 1 : -1);
      const b = Math.floor(Math.random() * 7) - 3;
      const c = Math.floor(Math.random() * 7) - 3;
      const p = (Math.floor(Math.random() * 2) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const q = Math.floor(Math.random() * 7) - 3;
      newCoeffs = { a, b, c, p, q };
    } while (
      (newCoeffs.a * newCoeffs.q * newCoeffs.q - newCoeffs.b * newCoeffs.p * newCoeffs.q + newCoeffs.c * newCoeffs.p * newCoeffs.p === 0 ||
        newCoeffs.p === 0) &&
      attempts < 50
    );

    onChange(newCoeffs);
  };

  const currentNumerator = formatQuadratic(coefficients.a, coefficients.b, coefficients.c);
  const currentDenominator = formatLinear(coefficients.p, coefficients.q);
  const currentVA = coefficients.p !== 0 ? formatFraction(-coefficients.q, coefficients.p) : 'Không xác định';

  // Helper render single coefficient card
  const renderCoefficientCard = (
    key: keyof FunctionCoefficients,
    label: string,
    mathSymbol: string,
    subtext: string,
    isDenominator: boolean = false,
    quickValues: number[] = [-2, -1, 1, 2]
  ) => {
    const val = coefficients[key];
    const isProhibitedZero = (key === 'a' || key === 'p') && val === 0;

    return (
      <div
        key={key}
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
          isProhibitedZero
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/60 shadow-sm'
            : isDenominator
            ? 'bg-indigo-50/40 dark:bg-slate-900/80 border-indigo-200/70 dark:border-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs'
            : 'bg-blue-50/40 dark:bg-slate-900/80 border-blue-200/70 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-cyan-600 shadow-xs'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDenominator ? 'bg-indigo-500' : 'bg-blue-600 dark:bg-cyan-400'}`} />
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              Hệ số <span className={isDenominator ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-cyan-400'}>{label}</span>
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            {mathSymbol}
          </span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 truncate" title={subtext}>
          {subtext}
        </div>

        {/* Stepper + Big Numeric Input */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <button
            type="button"
            title={`Giảm ${label} đi 1`}
            onClick={() => handleStep(key, -1)}
            className="w-9 h-10 shrink-0 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              inputMode="numeric"
              value={inputStrings[key] ?? String(val)}
              onChange={(e) => handleInputChange(key, e.target.value)}
              onBlur={() => handleInputBlur(key)}
              className={`w-full h-10 text-center font-mono text-xl font-black rounded-xl border-2 transition-all focus:outline-none focus:ring-2 shadow-xs ${
                isProhibitedZero
                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-400'
                  : 'bg-white dark:bg-slate-950 text-slate-950 dark:text-white border-slate-300 dark:border-slate-600 focus:border-blue-600 dark:focus:border-cyan-400 focus:ring-blue-500/20'
              }`}
            />
          </div>

          <button
            type="button"
            title={`Tăng ${label} lên 1`}
            onClick={() => handleStep(key, 1)}
            className="w-9 h-10 shrink-0 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick set buttons (-2, -1, 1, 2) */}
        <div className="flex items-center justify-between gap-1 mb-2">
          {quickValues.map((qVal) => (
            <button
              key={qVal}
              type="button"
              onClick={() => handleQuickSet(key, qVal)}
              className={`flex-1 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                val === qVal
                  ? isDenominator
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-blue-600 dark:bg-cyan-500 text-white border-blue-600 dark:border-cyan-500 shadow-xs'
                  : 'bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {qVal > 0 ? `+${qVal}` : qVal}
            </button>
          ))}
        </div>

        {/* Dynamic Range Slider */}
        <div className="pt-1">
          <input
            type="range"
            min={Math.min(-20, val - 10)}
            max={Math.max(20, val + 10)}
            step="1"
            value={val}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10) || 0;
              handleUpdate(key, num);
              setInputStrings((prev) => ({ ...prev, [key]: String(num) }));
            }}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-800 ${
              isDenominator ? 'accent-indigo-600' : 'accent-blue-600 dark:accent-cyan-400'
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5 transition-colors relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:via-cyan-400 before:to-indigo-500 before:rounded-t-3xl">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              THIẾT LẬP HÀM SỐ TOÁN HỌC
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Khảo sát hàm phân thức hữu tỉ bậc hai trên bậc nhất: <MathView math="y = \frac{ax^2 + bx + c}{px + q}" />
          </p>
        </div>

        {/* Action Buttons: Presets, Random, Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'presets' ? 'input' : 'presets')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              activeTab === 'presets'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hàm mẫu SGK 12</span>
          </button>

          <button
            onClick={handleRandom}
            title="Tạo ngẫu nhiên một hàm số có cực trị đẹp"
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-cyan-300 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-900/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Dices className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Ngẫu nhiên</span>
          </button>

          <button
            onClick={handleReset}
            title="Khôi phục lại hàm chuẩn SGK ban đầu"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Presets Grid Drawer */}
      {activeTab === 'presets' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Chọn nhanh các dạng hàm số tiêu biểu trong chương trình Giải tích 12:
            </span>
            <span className="text-[11px] text-slate-400">Nhấp để áp dụng ngay</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onChange(p.coeffs);
                  setActiveTab('input');
                }}
                className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/50 transition-all cursor-pointer group shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-sans">
                    {p.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-serif font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                  <MathView math={p.formulaLatex} />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. KHUNG THIẾT LẬP HÀM SỐ TOÁN HỌC (GỌN TRÊN 1 DÒNG) */}
      <div className="px-4 py-3 sm:px-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950 border border-blue-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Vế trái: Tên & Công thức hàm số nằm gọn trên 1 dòng duy nhất */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <span className="text-xs uppercase tracking-wider font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5 shrink-0">
            <Layers className="w-4 h-4 shrink-0" />
            <span>Hàm số:</span>
          </span>
          <div className="text-lg sm:text-xl md:text-2xl font-serif font-black text-slate-900 dark:text-white whitespace-nowrap tracking-wide py-0.5">
            <MathView math={`y = \\frac{${currentNumerator}}{${currentDenominator}}`} />
          </div>
        </div>

        {/* Vế phải: Hệ số a, b, c, p, q và Tiệm cận đứng cùng nằm trên dòng này */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono text-xs">
          <span className="px-2 py-0.5 rounded-lg bg-blue-100/80 dark:bg-blue-950/70 text-blue-800 dark:text-cyan-300 font-bold border border-blue-200 dark:border-blue-900/60 whitespace-nowrap">
            a = {coefficients.a}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-100/80 dark:bg-blue-950/70 text-blue-800 dark:text-cyan-300 font-bold border border-blue-200 dark:border-blue-900/60 whitespace-nowrap">
            b = {coefficients.b}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-100/80 dark:bg-blue-950/70 text-blue-800 dark:text-cyan-300 font-bold border border-blue-200 dark:border-blue-900/60 whitespace-nowrap">
            c = {coefficients.c}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="px-2 py-0.5 rounded-lg bg-indigo-100/80 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900/60 whitespace-nowrap">
            p = {coefficients.p}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-indigo-100/80 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900/60 whitespace-nowrap">
            q = {coefficients.q}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900/60 whitespace-nowrap inline-flex items-center gap-1">
            <span>TCĐ:</span>
            <MathView math={`x = ${currentVA}`} />
          </span>
        </div>
      </div>

      {/* Invalid Warning Banner */}
      {!isValid && validationError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/40 rounded-2xl text-rose-700 dark:text-rose-200 text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{validationError}</div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Khôi phục hàm chuẩn SGK
          </button>
        </div>
      )}

      {/* 3. GROUP 1: TỬ THỨC u(x) = ax² + bx + c (BẬC HAI) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400" />
            <span className="uppercase tracking-wider">Tử thức:</span>
            <span className="font-serif text-sm font-bold text-blue-700 dark:text-cyan-400">
              u(x) = ax² + bx + c
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
            Đa thức bậc hai (yêu cầu a ≠ 0)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {renderCoefficientCard('a', 'a', 'x²', 'Hệ số x² ở tử (a ≠ 0)', false, [-2, -1, 1, 2])}
          {renderCoefficientCard('b', 'b', 'x', 'Hệ số x ở tử', false, [-3, -1, 1, 2])}
          {renderCoefficientCard('c', 'c', '1', 'Hệ số tự do ở tử', false, [-3, 1, 2, 3])}
        </div>
      </div>

      {/* 4. GROUP 2: MẪU THỨC v(x) = px + q (BẬC NHẤT) */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="uppercase tracking-wider">Mẫu thức:</span>
            <span className="font-serif text-sm font-bold text-indigo-600 dark:text-indigo-400">
              v(x) = px + q
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
            Đa thức bậc nhất (yêu cầu p ≠ 0, làm sinh ra tiệm cận đứng)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderCoefficientCard('p', 'p', 'x', 'Hệ số x ở mẫu (p ≠ 0)', true, [-2, -1, 1, 2])}
          {renderCoefficientCard('q', 'q', '1', 'Hệ số tự do ở mẫu (TCĐ x = -q/p)', true, [-2, -1, 1, 2])}
        </div>
      </div>
    </div>
  );
};
