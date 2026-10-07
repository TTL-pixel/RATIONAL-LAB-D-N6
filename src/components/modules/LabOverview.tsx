import React from 'react';
import { FunctionCoefficients } from '../../types/math';
import { MathView } from '../math-ui/MathView';
import { 
  Target, 
  Maximize2, 
  ArrowRight, 
  Sparkles, 
  Compass,
  Layers,
  Split,
  Bot
} from 'lucide-react';

interface LabOverviewProps {
  onNavigateToTab: (tabId: string) => void;
  onApplyPreset: (coeffs: FunctionCoefficients) => void;
}

export const LabOverview: React.FC<LabOverviewProps> = ({
  onNavigateToTab,
  onApplyPreset,
}) => {
  const samplePresets = [
    {
      title: 'Hàm Chuẩn SGK 12',
      formula: 'y = \\frac{x^2 + 2x + 3}{x - 1}',
      coeffs: { a: 1, b: 2, c: 3, p: 1, q: -1 },
      badge: '2 Cực trị · Đẹp',
      desc: 'TCĐ x = 1, TCX y = x + 3, Tâm I(1; 4)',
    },
    {
      title: 'Hệ Số Bậc Hai a = 2',
      formula: 'y = \\frac{2x^2 - 3x + 1}{x + 2}',
      coeffs: { a: 2, b: -3, c: 1, p: 1, q: 2 },
      badge: 'TCX: y = 2x - 7',
      desc: 'Độ dốc TCX lớn, khoảng cách giữa 2 nhánh rộng',
    },
    {
      title: 'Hệ Số Âm (a = -1)',
      formula: 'y = \\frac{-x^2 + 3x - 3}{x - 1}',
      coeffs: { a: -1, b: 3, c: -3, p: 1, q: -1 },
      badge: 'Nghịch lý cực trị',
      desc: 'Đỉnh cực tiểu nằm trước (x < x₀), cực đại sau (x > x₀)',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 5. HERO SECTION - Modern Mathematical Laboratory */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xl dark:shadow-2xl">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-cyan-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>PHÒNG THÍ NGHIỆM GIẢI TÍCH TOÁN 12</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                RATIONAL LAB D
              </h1>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-wide">
                TÂM ĐỐI XỨNG VÀ CỰC TRỊ
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Khám phá mối liên hệ giữa đạo hàm, cực trị, tiệm cận và tâm đối xứng thông qua đồ thị tương tác.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateToTab('lab')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>Vào Phòng Thí Nghiệm</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onApplyPreset({ a: 1, b: 2, c: 3, p: 1, q: -1 });
                  onNavigateToTab('lab');
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Thử Hàm Mẫu SGK
              </button>
            </div>
          </div>

          {/* Hero Right Visual: Animated Mathematical Coordinate System */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] aspect-square rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-3 shadow-inner relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full h-full select-none">
                <defs>
                  {/* Subtle Grid Pattern */}
                  <pattern id="heroGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800/70" />
                  </pattern>
                  <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>

                {/* Grid */}
                <rect width="300" height="300" fill="url(#heroGrid)" />

                {/* Axes Ox & Oy */}
                <line x1="20" y1="150" x2="280" y2="150" stroke="currentColor" strokeWidth="1.2" className="text-slate-400 dark:text-slate-600" />
                <polygon points="280,147 286,150 280,153" className="fill-slate-400 dark:fill-slate-600" />
                <text x="282" y="142" fontSize="9" fontWeight="bold" className="fill-slate-400 dark:fill-slate-500 font-mono">x</text>

                <line x1="150" y1="280" x2="150" y2="20" stroke="currentColor" strokeWidth="1.2" className="text-slate-400 dark:text-slate-600" />
                <polygon points="147,20 150,14 153,20" className="fill-slate-400 dark:fill-slate-600" />
                <text x="156" y="24" fontSize="9" fontWeight="bold" className="fill-slate-400 dark:fill-slate-500 font-mono">y</text>

                {/* Origin O */}
                <text x="140" y="162" fontSize="9" fontWeight="bold" className="fill-slate-400 dark:fill-slate-500 font-mono">O</text>

                {/* Vertical Asymptote x = x0 (Rose dashed) */}
                <line x1="130" y1="15" x2="130" y2="285" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="96" y="28" fontSize="8" fontWeight="bold" fill="#fb7185" className="font-mono">TCĐ: x = x₀</text>

                {/* Oblique Asymptote y = mx + n (Sky dashed) */}
                <line x1="25" y1="240" x2="275" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="195" y="68" fontSize="8" fontWeight="bold" fill="#38bdf8" className="font-mono">TCX: y = mx+n</text>

                {/* Hyperbolic Curves (Branch Left & Right with line animation) */}
                {/* Branch 1 (Left): Has Local Max at A(80, 185) */}
                <path
                  d="M 30 250 Q 80 180 120 285"
                  fill="none"
                  stroke="url(#curveGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-drawCurve"
                />

                {/* Branch 2 (Right): Has Local Min at B(180, 115) */}
                <path
                  d="M 140 15 Q 180 120 270 50"
                  fill="none"
                  stroke="url(#curveGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-drawCurve"
                />

                {/* Segment PP' passing through I (Gold dashed) */}
                <line x1="70" y1="198" x2="190" y2="102" stroke="#eab308" strokeWidth="1.2" strokeDasharray="3 2" />

                {/* Point P and P' */}
                <circle cx="70" cy="198" r="3" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                <text x="56" y="196" fontSize="7.5" fontWeight="bold" fill="#ca8a04" className="dark:fill-yellow-400 font-mono">P</text>

                <circle cx="190" cy="102" r="3" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
                <text x="196" y="104" fontSize="7.5" fontWeight="bold" fill="#ca8a04" className="dark:fill-yellow-400 font-mono">P'</text>

                {/* Extrema Points: Local Max A & Local Min B */}
                <circle cx="80" cy="188" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <text x="70" y="210" fontSize="8" fontWeight="bold" fill="#d97706" className="dark:fill-amber-400 font-sans">CĐ (A)</text>

                <circle cx="180" cy="112" r="4.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="172" y="98" fontSize="8" fontWeight="bold" fill="#4f46e5" className="dark:fill-indigo-300 font-sans">CT (B)</text>

                {/* Symmetry Center I (Pulsing Glow) */}
                <g transform="translate(130, 150)">
                  <circle cx="0" cy="0" r="10" fill="#f472b6" fillOpacity="0.2" className="animate-pulseGlow" />
                  <circle cx="0" cy="0" r="4.5" fill="#db2777" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="8" y="-6" fontSize="8.5" fontWeight="bold" fill="#db2777" className="dark:fill-pink-400 font-mono">I(x₀; y₀)</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 6. CORE INSIGHTS GRID - Laboratory Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: Tâm đối xứng */}
        <div 
          onClick={() => onNavigateToTab('symmetry')}
          className="lab-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500/40 shadow-sm dark:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-3 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">
            Tâm Đối Xứng &amp; Cặp Điểm P-P'
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Kiểm chứng trực quan giao điểm của TCĐ và TCX là tâm đối xứng I. Mọi điểm P trên đồ thị luôn có điểm đối xứng P' qua I cũng thuộc đồ thị.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400">
            <span>Khám phá tính chất I</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 2: Khảo sát cực trị */}
        <div 
          onClick={() => onNavigateToTab('extrema')}
          className="lab-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 shadow-sm dark:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 group-hover:scale-110 transition-transform">
            <Maximize2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
            Khảo Sát Cực Trị &amp; Điểm Dừng
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Quan sát sự đổi dấu của đạo hàm <MathView math="y'" /> qua các nghiệm của phương trình bậc hai ở tử số, tìm tọa độ cực đại và cực tiểu chính xác.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Kiểm tra đạo hàm y'</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 3: Thử thách dự đoán */}
        <div 
          onClick={() => onNavigateToTab('predict')}
          className="lab-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm dark:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
            8 Dạng Thử Thách Dự Đoán
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Rèn luyện tư duy nhận dạng đồ thị: dự đoán dáng điệu, góc phần tư tâm I, so sánh <MathView math="y_{CĐ}" /> và <MathView math="y_{CT}" /> trước khi mở đồ thị.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400">
            <span>Tham gia thử thách</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Preset Functions Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              HÀM SỐ MẪU ĐIỂN HÌNH (SGK GIẢI TÍCH 12)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chọn nhanh hàm số để quan sát các hiện tượng hình học phong phú
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {samplePresets.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => {
                onApplyPreset(preset.coeffs);
                onNavigateToTab('lab');
              }}
              className="lab-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{preset.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 font-mono font-semibold">
                  {preset.badge}
                </span>
              </div>
              <div className="py-2.5 text-center text-sm font-serif text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                <MathView math={preset.formula} />
              </div>
              <div className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                {preset.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
