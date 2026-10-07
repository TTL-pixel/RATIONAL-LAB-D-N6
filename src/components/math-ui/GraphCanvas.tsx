import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { RationalAnalysisResult, DisplayLayers } from '../../types/math';
import { evaluateRational, evaluateDerivative } from '../../math/rationalFunction';
import { formatDecimal } from '../../math/fraction';
import { MathView } from './MathView';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Grid, Eye, EyeOff, Brain, Sparkles } from 'lucide-react';

interface GraphCanvasProps {
  analysis: RationalAnalysisResult;
  layers: DisplayLayers;
  hiddenMode?: boolean;
  onRevealGraph?: () => void;
  probeX?: number;
  onProbeXChange?: (x: number) => void;
  showSymmetryProbe?: boolean;
  onNavigateToGraphTab?: () => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  analysis,
  layers,
  hiddenMode = false,
  onRevealGraph,
  probeX,
  onProbeXChange,
  showSymmetryProbe = true,
  onNavigateToGraphTab,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 950, height: 640 });
  const [showGridLines, setShowGridLines] = useState(true);

  // Coordinate view state
  const [viewState, setViewState] = useState({
    centerX: 0,
    centerY: 0,
    scale: 44, // px per unit (expanded)
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; title: string; subtitle?: string; value?: string } | null>(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: Math.max(300, entry.contentRect.width),
          height: Math.max(350, entry.contentRect.height),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update center when symmetry center changes or on initial valid analysis
  useEffect(() => {
    if (analysis.isValid) {
      setViewState((prev) => ({
        ...prev,
        centerX: analysis.symmetryCenter.x,
        centerY: Math.max(-8, Math.min(8, analysis.symmetryCenter.y)),
      }));
    }
  }, [analysis.coefficients.a, analysis.coefficients.p, analysis.coefficients.q, analysis.isValid]);

  // Coordinate transformations
  const toScreenX = useCallback((worldX: number) => {
    return dimensions.width / 2 + (worldX - viewState.centerX) * viewState.scale;
  }, [dimensions.width, viewState.centerX, viewState.scale]);

  const toScreenY = useCallback((worldY: number) => {
    return dimensions.height / 2 - (worldY - viewState.centerY) * viewState.scale;
  }, [dimensions.height, viewState.centerY, viewState.scale]);

  const toWorldX = useCallback((screenX: number) => {
    return viewState.centerX + (screenX - dimensions.width / 2) / viewState.scale;
  }, [dimensions.width, viewState.centerX, viewState.scale]);

  const toWorldY = useCallback((screenY: number) => {
    return viewState.centerY - (screenY - dimensions.height / 2) / viewState.scale;
  }, [dimensions.height, viewState.centerY, viewState.scale]);

  // View bounds
  const xMin = toWorldX(0);
  const xMax = toWorldX(dimensions.width);
  const yMin = toWorldY(dimensions.height);
  const yMax = toWorldY(0);

  // Zoom handlers
  const handleZoom = (factor: number) => {
    setViewState((prev) => ({
      ...prev,
      scale: Math.max(14, Math.min(130, prev.scale * factor)),
    }));
  };

  const handleResetView = () => {
    setViewState({
      centerX: analysis.isValid ? analysis.symmetryCenter.x : 0,
      centerY: analysis.isValid ? Math.max(-8, Math.min(8, analysis.symmetryCenter.y)) : 0,
      scale: 38,
    });
  };

  const handleFitView = () => {
    if (!analysis.isValid) return;
    const { symmetryCenter, extrema } = analysis;
    let minX = symmetryCenter.x - 3;
    let maxX = symmetryCenter.x + 3;
    let minY = symmetryCenter.y - 3;
    let maxY = symmetryCenter.y + 3;

    extrema.forEach((pt) => {
      minX = Math.min(minX, pt.x - 1.5);
      maxX = Math.max(maxX, pt.x + 1.5);
      minY = Math.min(minY, pt.y - 1.5);
      maxY = Math.max(maxY, pt.y + 1.5);
    });

    const spanX = Math.max(6, maxX - minX);
    const spanY = Math.max(6, maxY - minY);
    const scaleX = (dimensions.width * 0.75) / spanX;
    const scaleY = (dimensions.height * 0.75) / spanY;
    const newScale = Math.max(18, Math.min(80, Math.min(scaleX, scaleY)));

    setViewState({
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      scale: newScale,
    });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    handleZoom(factor);
  };

  // Drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wx = toWorldX(sx);
      const wy = toWorldY(sy);
      setHoverCoord({ x: wx, y: wy });

      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setViewState((prev) => ({
          ...prev,
          centerX: prev.centerX - dx / prev.scale,
          centerY: prev.centerY + dy / prev.scale,
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoverCoord(null);
    setActiveTooltip(null);
  };

  // Generate grid lines
  const gridStep = useMemo(() => {
    if (viewState.scale > 65) return 1;
    if (viewState.scale > 32) return 2;
    if (viewState.scale > 18) return 5;
    return 10;
  }, [viewState.scale]);

  const xGridLines = useMemo(() => {
    const lines: number[] = [];
    const start = Math.floor(xMin / gridStep) * gridStep;
    const end = Math.ceil(xMax / gridStep) * gridStep;
    for (let x = start; x <= end; x += gridStep) {
      lines.push(Math.round(x * 100) / 100);
    }
    return lines;
  }, [xMin, xMax, gridStep]);

  const yGridLines = useMemo(() => {
    const lines: number[] = [];
    const start = Math.floor(yMin / gridStep) * gridStep;
    const end = Math.ceil(yMax / gridStep) * gridStep;
    for (let y = start; y <= end; y += gridStep) {
      lines.push(Math.round(y * 100) / 100);
    }
    return lines;
  }, [yMin, yMax, gridStep]);

  // Curve sampling
  const x0 = analysis.excludedPoint;
  const numSamples = Math.min(1000, Math.max(300, Math.round(dimensions.width * 1.4)));
  const step = (xMax - xMin) / numSamples;

  const { leftPath, rightPath } = useMemo(() => {
    if (!analysis.isValid) return { leftPath: '', rightPath: '' };

    let lPath = '';
    let rPath = '';
    const safeMargin = 0.005;

    for (let i = 0; i <= numSamples; i++) {
      const x = xMin + i * step;
      if (Math.abs(x - x0) < safeMargin) continue;

      const y = evaluateRational(x, analysis.coefficients);
      if (y === null || isNaN(y) || !isFinite(y)) continue;

      const sx = toScreenX(x);
      const sy = toScreenY(y);

      // Clamp huge jumps
      if (sy < -600 || sy > dimensions.height + 600) continue;

      if (x < x0) {
        if (!lPath) lPath = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
        else lPath += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
      } else {
        if (!rPath) rPath = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
        else rPath += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
      }
    }

    return { leftPath: lPath, rightPath: rPath };
  }, [analysis.isValid, analysis.coefficients, xMin, xMax, step, x0, toScreenX, toScreenY, dimensions.height, numSamples]);

  // Oblique Asymptote path
  const obliquePath = useMemo(() => {
    if (!analysis.isValid) return '';
    const m = analysis.asymptotes.oblique.m;
    const n = analysis.asymptotes.oblique.n;
    const y1 = m * xMin + n;
    const y2 = m * xMax + n;
    return `M ${toScreenX(xMin)} ${toScreenY(y1)} L ${toScreenX(xMax)} ${toScreenY(y2)}`;
  }, [analysis.isValid, analysis.asymptotes.oblique, xMin, xMax, toScreenX, toScreenY]);

  // Probe Points P & P'
  const currentProbeX = probeX !== undefined ? probeX : analysis.symmetryCenter.x + 2;
  const currentProbeY = analysis.isValid ? evaluateRational(currentProbeX, analysis.coefficients) : null;
  const pPrimeX = 2 * analysis.symmetryCenter.x - currentProbeX;
  const pPrimeY = currentProbeY !== null ? 2 * analysis.symmetryCenter.y - currentProbeY : null;

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden select-none before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:via-cyan-400 before:to-indigo-500 before:z-10">
      {/* 8. GRAPH HEADER & TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            ĐỒ THỊ TƯƠNG TÁC
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
            · Tỉ lệ: {Math.round(viewState.scale)}px/đv
          </span>
        </div>

        {/* Toolbar: [Zoom +], [Zoom -], [Reset], [Fit], [Grid] */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => handleZoom(1.2)}
            title="Phóng to đồ thị (Zoom +)"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Phóng to</span>
          </button>

          <button
            onClick={() => handleZoom(0.83)}
            title="Thu nhỏ đồ thị (Zoom -)"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Thu nhỏ</span>
          </button>

          <button
            onClick={handleFitView}
            title="Tự động căn chỉnh vừa khung (Fit View)"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Căn chuẩn</span>
          </button>

          <button
            onClick={handleResetView}
            title="Đặt lại góc nhìn về gốc tọa độ & tâm đối xứng"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>

          <button
            onClick={() => setShowGridLines(!showGridLines)}
            title={showGridLines ? 'Tắt đường lưới tọa độ' : 'Bật đường lưới tọa độ'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-colors flex items-center gap-1 cursor-pointer ${
              showGridLines
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-900'
                : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưới</span>
          </button>

          {onNavigateToGraphTab && (
            <button
              onClick={onNavigateToGraphTab}
              title="Phóng to toàn màn hình - Chuyển sang chế độ xem đồ thị toàn cảnh"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-900/60 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-xs"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Xem toàn cảnh</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG CANVAS CONTAINER (Expanded viewport) */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="w-full h-[560px] sm:h-[620px] lg:h-[680px] relative cursor-grab active:cursor-grabbing bg-white dark:bg-[#060b14] overflow-hidden"
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full block"
        >
          {/* 1. Grid lines */}
          {layers.grid && showGridLines && (
            <g className="grid-lines">
              {xGridLines.map((x) => (
                <line
                  key={`gx-${x}`}
                  x1={toScreenX(x)}
                  y1={0}
                  x2={toScreenX(x)}
                  y2={dimensions.height}
                  stroke="currentColor"
                  strokeWidth="1"
                  className={x === 0 ? 'text-transparent' : 'text-slate-100 dark:text-slate-800/60'}
                />
              ))}
              {yGridLines.map((y) => (
                <line
                  key={`gy-${y}`}
                  x1={0}
                  y1={toScreenY(y)}
                  x2={dimensions.width}
                  y2={toScreenY(y)}
                  stroke="currentColor"
                  strokeWidth="1"
                  className={y === 0 ? 'text-transparent' : 'text-slate-100 dark:text-slate-800/60'}
                />
              ))}
            </g>
          )}

          {/* 2. Main Axes Ox & Oy */}
          <g className="axes">
            {/* Ox Axis */}
            <line
              x1={0}
              y1={toScreenY(0)}
              x2={dimensions.width}
              y2={toScreenY(0)}
              stroke="currentColor"
              strokeWidth="1.6"
              className="text-slate-500 dark:text-slate-400"
            />
            {/* Arrow Ox */}
            <polygon
              points={`${dimensions.width - 1},${toScreenY(0)} ${dimensions.width - 10},${toScreenY(0) - 4} ${dimensions.width - 10},${toScreenY(0) + 4}`}
              className="fill-slate-500 dark:fill-slate-400"
            />
            <text
              x={dimensions.width - 18}
              y={Math.max(20, Math.min(dimensions.height - 10, toScreenY(0) - 8))}
              fontSize="12"
              fontWeight="bold"
              className="fill-slate-700 dark:fill-slate-300 font-serif"
            >
              x
            </text>

            {/* Oy Axis */}
            <line
              x1={toScreenX(0)}
              y1={dimensions.height}
              x2={toScreenX(0)}
              y2={0}
              stroke="currentColor"
              strokeWidth="1.6"
              className="text-slate-500 dark:text-slate-400"
            />
            {/* Arrow Oy */}
            <polygon
              points={`${toScreenX(0)},1 ${toScreenX(0) - 4},10 ${toScreenX(0) + 4},10`}
              className="fill-slate-500 dark:fill-slate-400"
            />
            <text
              x={Math.max(10, Math.min(dimensions.width - 25, toScreenX(0) + 8))}
              y="18"
              fontSize="12"
              fontWeight="bold"
              className="fill-slate-700 dark:fill-slate-300 font-serif"
            >
              y
            </text>

            {/* Origin O */}
            <text
              x={toScreenX(0) - 14}
              y={toScreenY(0) + 16}
              fontSize="11"
              fontWeight="bold"
              className="fill-slate-400 dark:fill-slate-500 font-serif"
            >
              O
            </text>

            {/* Axis Tick Numbers */}
            {xGridLines.map((x) => {
              if (x === 0) return null;
              const sx = toScreenX(x);
              if (sx < 25 || sx > dimensions.width - 25) return null;
              if (Math.abs(sx - toScreenX(0)) < 22) return null;
              const axisY = Math.min(dimensions.height - 6, Math.max(16, toScreenY(0) + 14));
              return (
                <text
                  key={`tx-${x}`}
                  x={sx}
                  y={axisY}
                  fontSize="10"
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 font-mono select-none"
                >
                  {x}
                </text>
              );
            })}

            {yGridLines.map((y) => {
              if (y === 0) return null;
              const sy = toScreenY(y);
              if (sy < 20 || sy > dimensions.height - 20) return null;
              if (Math.abs(sy - toScreenY(0)) < 18) return null;
              const axisX = Math.max(16, Math.min(dimensions.width - 24, toScreenX(0) - 10));
              return (
                <text
                  key={`ty-${y}`}
                  x={axisX}
                  y={sy + 3.5}
                  fontSize="10"
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 font-mono select-none"
                >
                  {y}
                </text>
              );
            })}
          </g>

          {/* 3. Layers & Curves (when not hidden) */}
          {!hiddenMode && analysis.isValid && (
            <g className="graph-content">
              {/* Vertical Asymptote (TCĐ) */}
              {layers.verticalAsymptote && (
                <g className="vertical-asymptote">
                  <line
                    x1={toScreenX(x0)}
                    y1={0}
                    x2={toScreenX(x0)}
                    y2={dimensions.height}
                    stroke="#fb7185"
                    strokeWidth="1.8"
                    strokeDasharray="5 3"
                    className="cursor-pointer hover:stroke-rose-400 transition-colors"
                    onMouseEnter={() =>
                      setActiveTooltip({
                        x: toScreenX(x0),
                        y: 35,
                        title: 'Tiệm cận đứng',
                        subtitle: `x = ${analysis.asymptotes.vertical.exactX || x0.toFixed(2)}`,
                        value: 'Mẫu số bằng 0 (x ∉ D)',
                      })
                    }
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                  <text
                    x={toScreenX(x0) + 6}
                    y="30"
                    fill="#fb7185"
                    fontSize="11"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    TCĐ: x = {analysis.excludedPointExact}
                  </text>
                </g>
              )}

              {/* Oblique Asymptote (TCX) */}
              {layers.obliqueAsymptote && obliquePath && (
                <g className="oblique-asymptote">
                  <path
                    d={obliquePath}
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeDasharray="5 3"
                    className="cursor-pointer hover:stroke-sky-300 transition-colors"
                    onMouseEnter={() =>
                      setActiveTooltip({
                        x: toScreenX(analysis.symmetryCenter.x + 2),
                        y: toScreenY(analysis.asymptotes.oblique.m * (analysis.symmetryCenter.x + 2) + analysis.asymptotes.oblique.n),
                        title: 'Tiệm cận xiên',
                        subtitle: analysis.asymptotes.oblique.equation,
                        value: 'Phần thương khi chia đa thức tử cho mẫu',
                      })
                    }
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                  <text
                    x={dimensions.width - 130}
                    y={Math.max(25, Math.min(dimensions.height - 25, toScreenY(analysis.asymptotes.oblique.m * toWorldX(dimensions.width - 130) + analysis.asymptotes.oblique.n) - 8))}
                    fill="#0284c7"
                    className="dark:fill-sky-400 font-mono font-bold"
                    fontSize="11"
                  >
                    TCX: {analysis.asymptotes.oblique.equation}
                  </text>
                </g>
              )}

              {/* Extrema Line: y = u'/v' = (2ax+b)/p */}
              {layers.extremaLine && analysis.hasExtrema && (
                <g className="extrema-line">
                  <line
                    x1={toScreenX(xMin)}
                    y1={toScreenY((2 * analysis.coefficients.a / analysis.coefficients.p) * xMin + analysis.coefficients.b / analysis.coefficients.p)}
                    x2={toScreenX(xMax)}
                    y2={toScreenY((2 * analysis.coefficients.a / analysis.coefficients.p) * xMax + analysis.coefficients.b / analysis.coefficients.p)}
                    stroke="#a855f7"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    strokeOpacity="0.75"
                  />
                </g>
              )}

              {/* Main Hyperbolic Function Curves */}
              {layers.graph && (
                <g className="curve-paths">
                  {leftPath && (
                    <path
                      d={leftPath}
                      fill="none"
                      stroke="#0284c7"
                      className="dark:stroke-cyan-400 drop-shadow-sm"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  )}
                  {rightPath && (
                    <path
                      d={rightPath}
                      fill="none"
                      stroke="#0284c7"
                      className="dark:stroke-cyan-400 drop-shadow-sm"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              )}

              {/* Symmetry Probe: Point P, Symmetric Point P', and connecting line */}
              {layers.symmetryProbe && showSymmetryProbe && currentProbeY !== null && pPrimeY !== null && (
                <g className="symmetry-pair">
                  {/* Segment PP' through I */}
                  <line
                    x1={toScreenX(currentProbeX)}
                    y1={toScreenY(currentProbeY)}
                    x2={toScreenX(pPrimeX)}
                    y2={toScreenY(pPrimeY)}
                    stroke="#eab308"
                    strokeWidth="1.6"
                    strokeDasharray="4 2"
                    className="hover:stroke-amber-400 transition-colors"
                  />

                  {/* Point P */}
                  <g
                    className="cursor-pointer group"
                    onMouseEnter={() =>
                      setActiveTooltip({
                        x: toScreenX(currentProbeX),
                        y: toScreenY(currentProbeY),
                        title: 'Điểm P trên đồ thị',
                        subtitle: `P(${formatDecimal(currentProbeX, 2)}; ${formatDecimal(currentProbeY, 2)})`,
                        value: 'Điểm khảo sát tương tác',
                      })
                    }
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <circle
                      cx={toScreenX(currentProbeX)}
                      cy={toScreenY(currentProbeY)}
                      r="6"
                      fill="#eab308"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={toScreenX(currentProbeX) + 9}
                      y={toScreenY(currentProbeY) - 8}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#ca8a04"
                      className="dark:fill-yellow-300 font-mono"
                    >
                      P({formatDecimal(currentProbeX, 1)}; {formatDecimal(currentProbeY, 1)})
                    </text>
                  </g>

                  {/* Point P' */}
                  <g
                    className="cursor-pointer group"
                    onMouseEnter={() =>
                      setActiveTooltip({
                        x: toScreenX(pPrimeX),
                        y: toScreenY(pPrimeY),
                        title: "Điểm đối xứng P'",
                        subtitle: `P'(${formatDecimal(pPrimeX, 2)}; ${formatDecimal(pPrimeY, 2)})`,
                        value: 'Đối xứng với P qua tâm I (I là trung điểm PP\')',
                      })
                    }
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <circle
                      cx={toScreenX(pPrimeX)}
                      cy={toScreenY(pPrimeY)}
                      r="6"
                      fill="#eab308"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={toScreenX(pPrimeX) + 9}
                      y={toScreenY(pPrimeY) - 8}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#ca8a04"
                      className="dark:fill-yellow-300 font-mono"
                    >
                      P'({formatDecimal(pPrimeX, 1)}; {formatDecimal(pPrimeY, 1)})
                    </text>
                  </g>
                </g>
              )}

              {/* Intercepts Ox & Oy */}
              {layers.oxIntercepts &&
                analysis.intercepts.ox.map((pt, idx) => (
                  <g
                    key={`ox-${idx}`}
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setActiveTooltip({
                        x: toScreenX(pt.x),
                        y: toScreenY(0),
                        title: 'Giao điểm với trục Ox',
                        subtitle: `(${formatDecimal(pt.x, 2)}; 0)`,
                        value: 'Nghiệm của phương trình tử số ax² + bx + c = 0',
                      })
                    }
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <circle cx={toScreenX(pt.x)} cy={toScreenY(0)} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                ))}

              {layers.oyIntercept && analysis.intercepts.oy && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setActiveTooltip({
                      x: toScreenX(0),
                      y: toScreenY(analysis.intercepts.oy!.y),
                      title: 'Giao điểm với trục Oy',
                      subtitle: `(0; ${analysis.intercepts.oy!.exactY || formatDecimal(analysis.intercepts.oy!.y, 2)})`,
                      value: 'Giá trị hàm số tại x = 0 (f(0) = c/q)',
                    })
                  }
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <circle cx={toScreenX(0)} cy={toScreenY(analysis.intercepts.oy.y)} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              )}

              {/* Symmetry Center I */}
              {layers.symmetryCenter && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setActiveTooltip({
                      x: toScreenX(analysis.symmetryCenter.x),
                      y: toScreenY(analysis.symmetryCenter.y),
                      title: 'Tâm đối xứng I (Giao 2 tiệm cận)',
                      subtitle: `I\\left(${analysis.symmetryCenter.exactX};\\, ${analysis.symmetryCenter.exactY}\\right) \\approx (${formatDecimal(analysis.symmetryCenter.x, 2)};\\, ${formatDecimal(analysis.symmetryCenter.y, 2)})`,
                      value: 'Giao điểm của tiệm cận đứng và tiệm cận xiên',
                    })
                  }
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <circle
                    cx={toScreenX(analysis.symmetryCenter.x)}
                    cy={toScreenY(analysis.symmetryCenter.y)}
                    r="12"
                    fill="#f472b6"
                    fillOpacity="0.25"
                    className="animate-pulseGlow"
                  />
                  <circle
                    cx={toScreenX(analysis.symmetryCenter.x)}
                    cy={toScreenY(analysis.symmetryCenter.y)}
                    r="5"
                    fill="#db2777"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={toScreenX(analysis.symmetryCenter.x) + 9}
                    y={toScreenY(analysis.symmetryCenter.y) - 9}
                    fontSize="11"
                    fontWeight="bold"
                    fill="#db2777"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    paintOrder="stroke fill"
                    className="dark:fill-pink-400 font-mono text-white dark:text-[#060b14]"
                  >
                    I({formatDecimal(analysis.symmetryCenter.x, 1)}; {formatDecimal(analysis.symmetryCenter.y, 1)})
                  </text>
                </g>
              )}

              {/* Extrema Points (Cực đại & Cực tiểu) */}
              {analysis.hasExtrema &&
                analysis.extrema.map((pt, idx) => {
                  const isMax = pt.type === 'max';
                  if ((isMax && !layers.localMax) || (!isMax && !layers.localMin)) return null;

                  const sx = toScreenX(pt.x);
                  const sy = toScreenY(pt.y);
                  const color = isMax ? '#f59e0b' : '#818cf8';

                  return (
                    <g
                      key={`ext-${idx}`}
                      className="cursor-pointer group"
                      onMouseEnter={() =>
                        setActiveTooltip({
                          x: sx,
                          y: sy,
                          title: isMax ? 'Điểm Cực đại (MAX)' : 'Điểm Cực tiểu (MIN)',
                          subtitle: `${isMax ? 'CĐ' : 'CT'}\\left(${pt.xExact};\\, ${pt.yExact}\\right) \\approx (${formatDecimal(pt.x, 2)};\\, ${formatDecimal(pt.y, 2)})`,
                          value: `Hệ số góc tiếp tuyến y'(${formatDecimal(pt.x, 2)}) = 0`,
                        })
                      }
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <circle cx={sx} cy={sy} r="6" fill={color} stroke="#ffffff" strokeWidth="2.2" />
                      <text
                        x={sx + 9}
                        y={isMax ? sy - 9 : sy + 17}
                        fontSize="10.5"
                        fontWeight="bold"
                        fill={color}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                        className="font-sans text-white dark:text-[#060b14]"
                      >
                        {isMax ? 'CĐ' : 'CT'} ({formatDecimal(pt.x, 1)}; {formatDecimal(pt.y, 1)})
                      </text>
                    </g>
                  );
                })}
            </g>
          )}
        </svg>

        {/* 15. CHẾ ĐỘ ẨN ĐỒ THỊ (HIDDEN GRAPH / REASONING MODE OVERLAY) */}
        {hiddenMode && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-slate-900/80 dark:bg-slate-950/85 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-cyan-400 mb-4 shadow-lg">
              <Brain className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1">
              CHẾ ĐỘ SUY LUẬN &amp; DỰ ĐOÁN HÌNH DẠNG
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed mb-6 font-normal">
              Đồ thị đang được tạm ẩn. Hãy dùng trực giác toán học, quan sát dấu đạo hàm <span className="font-mono text-cyan-300">y'</span>, tiệm cận đứng và tiệm cận xiên để dự đoán hình dáng trước khi kiểm tra.
            </p>

            <button
              onClick={onRevealGraph}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>HIỆN ĐỒ THỊ ĐỂ KIỂM TRA</span>
            </button>
          </div>
        )}

        {/* Modern Floating Mathematical Tooltip */}
        {activeTooltip && !hiddenMode && (
          <div
            className="absolute z-30 pointer-events-none p-3 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/80 text-white shadow-xl text-xs space-y-0.5 animate-fadeIn"
            style={{
              left: Math.max(10, Math.min(dimensions.width - 200, activeTooltip.x + 12)),
              top: Math.max(10, Math.min(dimensions.height - 85, activeTooltip.y - 45)),
            }}
          >
            <div className="font-bold text-blue-400 dark:text-cyan-400 text-xs">
              {activeTooltip.title}
            </div>
            {activeTooltip.subtitle && (
              <div className="font-mono font-semibold text-white text-xs">
                <MathView math={activeTooltip.subtitle} />
              </div>
            )}
            {activeTooltip.value && (
              <div className="text-[11px] text-slate-400">
                {activeTooltip.value}
              </div>
            )}
          </div>
        )}

        {/* Coordinates readout bar in bottom-left */}
        {layers.coordinates && hoverCoord && !hiddenMode && (
          <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 shadow-sm pointer-events-none">
            x: <span className="text-slate-900 dark:text-white font-bold">{formatDecimal(hoverCoord.x, 2)}</span>, y: <span className="text-slate-900 dark:text-white font-bold">{formatDecimal(hoverCoord.y, 2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
