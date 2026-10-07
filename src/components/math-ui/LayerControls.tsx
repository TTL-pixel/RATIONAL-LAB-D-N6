import React, { useState } from 'react';
import { DisplayLayers, RationalAnalysisResult } from '../../types/math';
import { Layers, Info } from 'lucide-react';
import { MathView } from './MathView';

interface LayerControlsProps {
  layers: DisplayLayers;
  onChange: (layers: DisplayLayers) => void;
  analysis?: RationalAnalysisResult;
}

interface LayerItemConfig {
  key: keyof DisplayLayers;
  label: string;
  dotColor: string;
  badge: string;
  description: string;
  getDynamicFormula?: (analysis: RationalAnalysisResult) => string | null;
  formulaDescription?: string;
}

const LAYER_CONFIGS: LayerItemConfig[] = [
  {
    key: 'graph',
    label: 'Đồ thị f(x)',
    dotColor: 'bg-blue-500 dark:bg-cyan-400',
    badge: 'Đường cong',
    description: 'Đường cong phân thức bậc 2 trên bậc 1 gồm 2 nhánh phân cách bởi tiệm cận đứng và uốn quanh tiệm cận xiên.',
    getDynamicFormula: (a) => a.isValid ? a.latexFormula : 'y = \\frac{ax^2+bx+c}{px+q}',
    formulaDescription: 'Phương trình hàm số:',
  },
  {
    key: 'verticalAsymptote',
    label: 'Tiệm cận đứng',
    dotColor: 'bg-rose-500',
    badge: 'x = -q/p',
    description: 'Đường thẳng đứng đi qua điểm làm mẫu số triệt tiêu (px + q = 0). Đồ thị hàm số ép sát vô tận vào đường này.',
    getDynamicFormula: (a) => a.isValid ? a.asymptotes.vertical.equation : 'x = -\\frac{q}{p}',
    formulaDescription: 'Phương trình tiệm cận đứng:',
  },
  {
    key: 'obliqueAsymptote',
    label: 'Tiệm cận xiên',
    dotColor: 'bg-sky-500 dark:bg-sky-400',
    badge: 'y = mx + n',
    description: 'Phần thương số thu được khi chia đa thức tử cho mẫu. Khi x tiến ra vô cực, khoảng cách giữa đồ thị và đường thẳng tiến về 0.',
    getDynamicFormula: (a) => a.isValid ? a.asymptotes.oblique.equation : 'y = mx + n',
    formulaDescription: 'Phương trình tiệm cận xiên:',
  },
  {
    key: 'localMax',
    label: 'Điểm cực đại',
    dotColor: 'bg-amber-500',
    badge: 'Cực đại (CĐ)',
    description: 'Điểm đỉnh uốn của đồ thị hàm số, tại đó đạo hàm bậc nhất y\' = 0 và đổi dấu từ dương (+) sang âm (-).',
    getDynamicFormula: (a) => {
      if (!a.isValid || !a.hasExtrema) return null;
      const maxPt = a.extrema.find((e) => e.type === 'max');
      return maxPt ? `A\\left(${maxPt.xExact};\\, ${maxPt.yExact}\\right)` : null;
    },
    formulaDescription: 'Tọa độ điểm Cực đại:',
  },
  {
    key: 'localMin',
    label: 'Điểm cực tiểu',
    dotColor: 'bg-indigo-500',
    badge: 'Cực tiểu (CT)',
    description: 'Điểm đáy uốn của đồ thị hàm số, tại đó đạo hàm bậc nhất y\' = 0 và đổi dấu từ âm (-) sang dương (+).',
    getDynamicFormula: (a) => {
      if (!a.isValid || !a.hasExtrema) return null;
      const minPt = a.extrema.find((e) => e.type === 'min');
      return minPt ? `B\\left(${minPt.xExact};\\, ${minPt.yExact}\\right)` : null;
    },
    formulaDescription: 'Tọa độ điểm Cực tiểu:',
  },
  {
    key: 'symmetryCenter',
    label: 'Tâm đối xứng I',
    dotColor: 'bg-pink-500',
    badge: 'Giao 2 tiệm cận',
    description: 'Giao điểm duy nhất của tiệm cận đứng và tiệm cận xiên. Là trung điểm của đoạn thẳng nối mọi cặp điểm đối xứng trên 2 nhánh đồ thị.',
    getDynamicFormula: (a) => a.isValid ? `I\\left(${a.symmetryCenter.exactX};\\, ${a.symmetryCenter.exactY}\\right)` : 'I(x_0; y_0)',
    formulaDescription: 'Tọa độ Tâm đối xứng:',
  },
  {
    key: 'symmetryProbe',
    label: "Cặp đối xứng P & P'",
    dotColor: 'bg-yellow-500',
    badge: "Cặp P - P'",
    description: "Cặp điểm P và P' trên 2 nhánh của đồ thị đối xứng qua tâm I. Điểm I luôn là trung điểm của đoạn thẳng PP', tiếp tuyến tại P và P' song song nhau.",
    getDynamicFormula: () => 'x_{P\'} = 2x_I - x_P, \\quad y_{P\'} = 2y_I - y_P',
    formulaDescription: 'Công thức tọa độ đối xứng:',
  },
  {
    key: 'extremaLine',
    label: 'Đường nối cực trị',
    dotColor: 'bg-purple-500',
    badge: 'u\'/v\'',
    description: 'Đường thẳng đi qua cả hai điểm cực đại và cực tiểu, có hệ số góc bằng đạo hàm tử thức chia đạo hàm mẫu thức.',
    getDynamicFormula: (a) => a.isValid && a.hasExtrema && a.extremaLineEquation ? a.extremaLineEquation : 'y = \\frac{2ax + b}{p}',
    formulaDescription: 'Phương trình đường thẳng:',
  },
  {
    key: 'oxIntercepts',
    label: 'Giao điểm Ox',
    dotColor: 'bg-emerald-500',
    badge: 'y = 0',
    description: 'Các điểm giao nhau giữa đồ thị và trục hoành Ox. Hoành độ là nghiệm của phương trình tử số ax² + bx + c = 0.',
    getDynamicFormula: (a) => {
      if (!a.isValid) return null;
      if (a.intercepts.ox.length === 0) return '\\text{Không cắt trục Ox (Vô nghiệm)}';
      return a.intercepts.ox.map((p) => `(${p.exactX || p.x.toFixed(2)}; 0)`).join(', \\quad ');
    },
    formulaDescription: 'Giao điểm với trục hoành:',
  },
  {
    key: 'oyIntercept',
    label: 'Giao điểm Oy',
    dotColor: 'bg-emerald-500',
    badge: 'x = 0',
    description: 'Điểm giao nhau giữa đồ thị và trục tung Oy tại x = 0. Tung độ tương ứng là f(0) = c/q (khi 0 thuộc tập xác định).',
    getDynamicFormula: (a) => {
      if (!a.isValid) return null;
      if (!a.intercepts.oy) return '\\text{Không cắt Oy (x = 0 không thuộc TXĐ)}';
      return `(0; ${a.intercepts.oy.exactY || a.intercepts.oy.y.toFixed(2)})`;
    },
    formulaDescription: 'Giao điểm với trục tung:',
  },
  {
    key: 'grid',
    label: 'Lưới tọa độ',
    dotColor: 'bg-slate-400',
    badge: 'Lưới Oxy',
    description: 'Hệ trục tọa độ Descartes Oxy với các vạch chia đơn vị chuẩn, hỗ trợ định vị trực quan khoảng cách và tọa độ các điểm.',
    getDynamicFormula: () => '\\Delta x = 1, \\quad \\Delta y = 1',
    formulaDescription: 'Độ chia lưới tọa độ:',
  },
  {
    key: 'coordinates',
    label: 'Hiển thị tọa độ',
    dotColor: 'bg-slate-400',
    badge: '(x; y) chuột',
    description: 'Bảng theo dõi số đo tọa độ thực tế (x; y) tại vị trí con trỏ chuột khi rê trên mặt phẳng hệ trục tọa độ.',
    getDynamicFormula: () => 'M(x_M; y_M)',
    formulaDescription: 'Tọa độ thời gian thực:',
  },
];

export const LayerControls: React.FC<LayerControlsProps> = ({ layers, onChange, analysis }) => {
  const [hoveredConfig, setHoveredConfig] = useState<LayerItemConfig | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const toggle = (key: keyof DisplayLayers) => {
    onChange({
      ...layers,
      [key]: !layers[key],
    });
  };

  const handleMouseEnter = (cfg: LayerItemConfig, e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredConfig(cfg);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoveredConfig(null);
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-3 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wider uppercase">
            LỚP HIỂN THỊ TRÊN ĐỒ THỊ
          </h3>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Di chuột vào ô để xem chi tiết đối tượng</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {LAYER_CONFIGS.map((item) => {
          const checked = layers[item.key];
          return (
            <div
              key={item.key}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
              className="relative group"
            >
              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                  checked
                    ? 'bg-blue-50/70 dark:bg-slate-800/90 border-blue-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.key)}
                  className="w-3.5 h-3.5 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-blue-600 dark:text-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-600 dark:accent-cyan-400"
                />
                <span className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`} />
                <span className="truncate">{item.label}</span>
              </label>
            </div>
          );
        })}
      </div>

      {/* FLOATING HOVER TOOLTIP CARD: Shows detailed information & mathematical formulas on hover */}
      {hoveredConfig && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs space-y-2 animate-fadeIn"
          style={{
            left: `${Math.max(160, Math.min(window.innerWidth - 160, tooltipPos.x))}px`,
            top: `${tooltipPos.y - 8}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <span className={`w-2 h-2 rounded-full ${hoveredConfig.dotColor}`} />
              <span>{hoveredConfig.label}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
              {hoveredConfig.badge}
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {hoveredConfig.description}
          </p>

          {/* Real-time Dynamic Math Formula / Value */}
          {analysis && hoveredConfig.getDynamicFormula && (
            (() => {
              const formula = hoveredConfig.getDynamicFormula(analysis);
              if (!formula) return null;
              return (
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {hoveredConfig.formulaDescription || 'Giá trị hiện tại:'}
                  </div>
                  <div className="font-mono text-cyan-300 text-xs text-center py-0.5 overflow-x-auto">
                    <MathView math={formula} />
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
