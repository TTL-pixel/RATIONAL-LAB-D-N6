import React, { useState } from 'react';
import { 
  Home, 
  Sliders, 
  LineChart, 
  Calculator, 
  Maximize2, 
  Split, 
  Table, 
  Target, 
  Compass, 
  Bot,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Defined according to user's EdTech specifications:
  const menuItems = [
    { id: 'overview', symbol: '⌂', label: 'Tổng quan', icon: Home },
    { id: 'lab', symbol: 'ƒ', label: 'Nhập hàm số', icon: Sliders },
    { id: 'graph', symbol: '◉', label: 'Đồ thị tương tác', icon: LineChart },
    { id: 'derivative', symbol: 'dy', label: 'Đạo hàm & Nghiệm', icon: Calculator },
    { id: 'extrema', symbol: '∗', label: 'Khảo sát cực trị', icon: Maximize2 },
    { id: 'asymptotes', symbol: '∥', label: 'Tiệm cận đứng & xiên', icon: Split },
    { id: 'symmetry', symbol: '↔', label: 'Tâm đối xứng & Cặp P-P\'', icon: Target },
    { id: 'table', symbol: '⇅', label: 'Bảng biến thiên', icon: Table },
    { id: 'quiz', symbol: '◈', label: 'Luyện tập trắc nghiệm', icon: Layers },
    { id: 'predict', symbol: '🎯', label: 'Thử thách dự đoán', icon: Compass },
    { id: 'tutor', symbol: '🤖', label: 'AI Math Tutor', icon: Bot },
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } shrink-0 hidden md:flex flex-col justify-between bg-white dark:bg-slate-950/70 border-r border-slate-200 dark:border-slate-800/80 p-3 transition-all duration-300 min-h-[calc(100vh-3.75rem)] sticky top-15 z-30 select-none`}
    >
      <div className="space-y-4">
        {/* Collapse / Expand Toggle Button */}
        <div className="flex items-center justify-between px-2 pt-1">
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              DANH MỤC HỌC TẬP
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ml-auto"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border-l-3 border-blue-600 dark:border-cyan-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  {/* Icon or Symbol */}
                  <span className={`flex items-center justify-center shrink-0 ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                    <Icon className="w-4 h-4" />
                  </span>

                  {/* Text Label (when not collapsed) */}
                  {!isCollapsed && (
                    <span className="truncate flex-1">
                      {item.label}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    <span className="font-mono text-cyan-400 mr-1.5">{item.symbol}</span>
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Math Tip / Memory Box (when not collapsed) */}
      {!isCollapsed && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed mt-4">
          <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ghi nhớ giải tích:</span>
          </div>
          <div>
            Hoành độ tâm đối xứng <span className="text-pink-500 dark:text-pink-400 font-mono font-bold">xI</span> luôn là trung điểm của hoành độ 2 cực trị:
            <div className="font-mono text-blue-600 dark:text-cyan-300 font-bold mt-1 text-[11px]">
              xI = (x₁ + x₂) / 2 = -q/p
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
