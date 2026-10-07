import React, { useState, useMemo, useEffect } from 'react';
import { FunctionCoefficients, DisplayLayers } from './types/math';
import { analyzeRationalFunction } from './math/rationalFunction';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MathView } from './components/math-ui/MathView';
import { FunctionInput } from './components/math-ui/FunctionInput';
import { GraphCanvas } from './components/math-ui/GraphCanvas';
import { LayerControls } from './components/math-ui/LayerControls';
import { VariationTable } from './components/math-ui/VariationTable';
import { StepByStepAnalysis } from './components/math-ui/StepByStepAnalysis';
import { SymmetryExplorer } from './components/modules/SymmetryExplorer';
import { ExtremaExplorer } from './components/modules/ExtremaExplorer';
import { PredictionChallenge } from './components/modules/PredictionChallenge';
import { PracticeQuiz } from './components/modules/PracticeQuiz';
import { AITutor } from './components/modules/AITutor';
import { LabOverview } from './components/modules/LabOverview';
import { 
  Eye, 
  EyeOff, 
  Sparkles,
  Split,
  Target,
  Maximize2
} from 'lucide-react';

export default function App() {
  // 1. Core Function Coefficients
  const [coefficients, setCoefficients] = useState<FunctionCoefficients>({
    a: 1,
    b: 2,
    c: 3,
    p: 1,
    q: -1,
  });

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('lab');

  // 3. Theme State (default dark, restored from localStorage)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('rational_lab_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  // 4. Graph Layers Visibility
  const [layers, setLayers] = useState<DisplayLayers>({
    graph: true,
    verticalAsymptote: true,
    obliqueAsymptote: true,
    localMax: true,
    localMin: true,
    symmetryCenter: true,
    oxIntercepts: true,
    oyIntercept: true,
    grid: true,
    coordinates: true,
    symmetrySegment: true,
    extremaLine: true,
    symmetryProbe: true,
  });

  // 5. Special Hidden Graph Mode (Chế độ suy luận)
  const [hiddenMode, setHiddenMode] = useState<boolean>(false);

  // 6. Interactive Explorers probe X position
  const [probeX, setProbeX] = useState<number>(0);

  // 7. Gamification: XP & Streak
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('rational_lab_xp');
    return saved ? parseInt(saved, 10) : 50;
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('rational_lab_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Save XP and Streak
  useEffect(() => {
    localStorage.setItem('rational_lab_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('rational_lab_streak', streak.toString());
  }, [streak]);

  const addXp = (amount: number) => setXp((prev) => prev + amount);
  const incrementStreak = () => setStreak((prev) => prev + 1);
  const resetStreak = () => setStreak(0);

  // Synchronous Mathematical Analysis Engine
  const analysis = useMemo(() => {
    return analyzeRationalFunction(coefficients);
  }, [coefficients]);

  // Sync probe X when coefficients change to a nice spot near center
  useEffect(() => {
    if (analysis.isValid) {
      setProbeX(analysis.symmetryCenter.x + 2);
    }
  }, [analysis.isValid, analysis.coefficients.a, analysis.coefficients.p, analysis.coefficients.q]);

  // Theme switch effect
  useEffect(() => {
    localStorage.setItem('rational_lab_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-[#040812] text-slate-100 antialiased font-sans';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900 antialiased font-sans';
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040812] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative transition-colors duration-200 math-grid-bg">
      {/* 9. SUBTLE MATHEMATICAL BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-40 dark:opacity-25">
        {/* Subtle Faint Math Symbols */}
        <span className="absolute top-28 left-[12%] text-6xl font-serif text-slate-400 dark:text-slate-700 opacity-20">∫</span>
        <span className="absolute top-48 right-[10%] text-5xl font-serif text-slate-400 dark:text-slate-700 opacity-15">π</span>
        <span className="absolute top-[60%] left-[6%] text-6xl font-serif text-slate-400 dark:text-slate-700 opacity-15">∑</span>
        <span className="absolute top-[75%] right-[14%] text-5xl font-serif text-slate-400 dark:text-slate-700 opacity-20">√</span>
        <span className="absolute top-[40%] right-[3%] text-6xl font-serif text-slate-400 dark:text-slate-700 opacity-15">∞</span>
      </div>

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        xp={xp}
        streak={streak}
      />

      {/* Main Workspace Layout with Sidebar */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto relative z-10">
        {/* Desktop Sidebar (Collapsible) */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <LabOverview
              onNavigateToTab={setActiveTab}
              onApplyPreset={(newCoeffs) => {
                setCoefficients(newCoeffs);
                addXp(10);
              }}
            />
          )}

          {/* TAB 2: MAIN LAB (Phòng thí nghiệm tương tác tổng hợp) */}
          {activeTab === 'lab' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Function Banner & Formula Header */}
              <div className="relative flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:via-cyan-400 before:to-indigo-500 before:rounded-t-2xl">
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400"></span>
                    <span>Hàm số đang khảo sát</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-serif text-slate-900 dark:text-white font-bold pt-2 pb-1 min-h-[3.2rem] flex items-center overflow-x-auto">
                    <MathView math={analysis.latexFormula} className="text-xl sm:text-2xl" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHiddenMode(!hiddenMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      hiddenMode
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {hiddenMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{hiddenMode ? 'Đang ẩn đồ thị' : 'Chế độ suy luận (Ẩn đồ thị)'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tutor')}
                    className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-cyan-300 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>Hỏi Gia Sư AI</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Responsive Workspace: Expanded Interactive Graph on Right (7 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Function Input, Variation Table, 12-Step Analysis (5 cols) */}
                <div className="order-1 lg:col-span-5 xl:col-span-5 space-y-6">
                  {/* Function Input Controls */}
                  <FunctionInput
                    coefficients={coefficients}
                    onChange={(c) => {
                      setCoefficients(c);
                      addXp(5);
                    }}
                    isValid={analysis.isValid}
                    validationError={analysis.validationError}
                  />

                  {/* Variation Table */}
                  <VariationTable analysis={analysis} />

                  {/* 12 Step Cards Analysis */}
                  <StepByStepAnalysis analysis={analysis} />
                </div>

                {/* Right Column: Expanded Sticky Interactive Graph (7 cols) */}
                <div className="order-2 lg:col-span-7 xl:col-span-7 space-y-4 lg:sticky lg:top-18">
                  <GraphCanvas
                    analysis={analysis}
                    layers={layers}
                    hiddenMode={hiddenMode}
                    onRevealGraph={() => setHiddenMode(false)}
                    probeX={probeX}
                    onProbeXChange={setProbeX}
                    showSymmetryProbe={true}
                    onNavigateToGraphTab={() => setActiveTab('graph')}
                  />

                  <LayerControls layers={layers} onChange={setLayers} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRAPH ONLY */}
          {activeTab === 'graph' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400"></span>
                  HỆ TỌA ĐỘ DESCARTES TƯƠNG TÁC
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Công thức: <MathView math={analysis.latexFormula} />
                </div>
              </div>

              <GraphCanvas
                analysis={analysis}
                layers={layers}
                hiddenMode={hiddenMode}
                onRevealGraph={() => setHiddenMode(false)}
                probeX={probeX}
                onProbeXChange={setProbeX}
                showSymmetryProbe={true}
              />

              <LayerControls layers={layers} onChange={setLayers} />
            </div>
          )}

          {/* TAB 4: DERIVATIVE ONLY */}
          {activeTab === 'derivative' && (
            <div className="space-y-6 animate-fadeIn">
              <FunctionInput
                coefficients={coefficients}
                onChange={setCoefficients}
                isValid={analysis.isValid}
                validationError={analysis.validationError}
              />
              <StepByStepAnalysis analysis={analysis} />
            </div>
          )}

          {/* TAB 5: EXTREMA EXPLORER */}
          {activeTab === 'extrema' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
              <div className="lg:col-span-6 xl:col-span-6 space-y-6">
                <ExtremaExplorer
                  analysis={analysis}
                  probeX={probeX}
                  onProbeXChange={setProbeX}
                />
              </div>

              <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-18 space-y-4">
                <GraphCanvas
                  analysis={analysis}
                  layers={{ ...layers, localMax: true, localMin: true, extremaLine: true }}
                  probeX={probeX}
                  onProbeXChange={setProbeX}
                />
              </div>
            </div>
          )}

          {/* TAB 6: ASYMPTOTES */}
          {activeTab === 'asymptotes' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Asymptotes Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-rose-500 before:rounded-t-2xl">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <Split className="w-4 h-4 text-rose-500" />
                    Tiệm cận đứng (x = -q/p)
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white py-1">
                    <MathView math={analysis.asymptotes.vertical.equation} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tại điểm làm mẫu số bằng 0, đồ thị hàm số tiến ra vô cực và ép sát vào đường thẳng thẳng đứng này: <MathView math={`x = ${analysis.excludedPointExact}`} />.
                  </p>
                </div>

                <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-sky-500 before:rounded-t-2xl">
                  <div className="text-xs font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <Split className="w-4 h-4 text-sky-500" />
                    Tiệm cận xiên (y = mx + n)
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white py-1">
                    <MathView math={analysis.asymptotes.oblique.equation} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Thu được từ thương số của phép chia đa thức tử cho mẫu. Khi <MathView math="x \to \pm\infty" />, phần dư triệt tiêu dần về 0.
                  </p>
                </div>
              </div>

              <GraphCanvas
                analysis={analysis}
                layers={{ ...layers, verticalAsymptote: true, obliqueAsymptote: true, symmetryCenter: true }}
              />
            </div>
          )}

          {/* TAB 7: VARIATION TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-6 animate-fadeIn">
              <VariationTable analysis={analysis} />
              <StepByStepAnalysis analysis={analysis} />
            </div>
          )}

          {/* TAB 8: SYMMETRY EXPLORER */}
          {activeTab === 'symmetry' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
              <div className="lg:col-span-6 xl:col-span-6 space-y-6">
                <SymmetryExplorer
                  analysis={analysis}
                  probeX={probeX}
                  onProbeXChange={setProbeX}
                />
              </div>

              <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-18 space-y-4">
                <GraphCanvas
                  analysis={analysis}
                  layers={{ ...layers, symmetryCenter: true, verticalAsymptote: true, obliqueAsymptote: true }}
                  probeX={probeX}
                  onProbeXChange={setProbeX}
                  showSymmetryProbe={true}
                />
              </div>
            </div>
          )}

          {/* TAB 9: PREDICTION CHALLENGE */}
          {activeTab === 'predict' && (
            <div className="space-y-6 animate-fadeIn">
              <PredictionChallenge
                analysis={analysis}
                hiddenMode={hiddenMode}
                onToggleHiddenMode={() => setHiddenMode(!hiddenMode)}
                onAddXp={addXp}
              />

              <GraphCanvas
                analysis={analysis}
                layers={layers}
                hiddenMode={hiddenMode}
                onRevealGraph={() => setHiddenMode(false)}
              />

              <VariationTable analysis={analysis} />
            </div>
          )}

          {/* TAB 10: PRACTICE QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-6 animate-fadeIn">
              <PracticeQuiz
                currentCoeffs={coefficients}
                onAddXp={addXp}
                streak={streak}
                onIncrementStreak={incrementStreak}
                onResetStreak={resetStreak}
              />
            </div>
          )}

          {/* TAB 11: AI TUTOR */}
          {activeTab === 'tutor' && (
            <div className="space-y-6 animate-fadeIn">
              <AITutor coefficients={coefficients} />
            </div>
          )}
        </main>
      </div>

      {/* Footer conforming to domain-native aesthetic */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            RATIONAL LAB D · Khảo sát hàm số phân thức bậc hai trên bậc nhất
          </div>
          <div className="text-slate-400 dark:text-slate-500">
            Chương trình Toán 12 THPT Việt Nam · Modern Mathematical Laboratory
          </div>
        </div>
      </footer>
    </div>
  );
}
