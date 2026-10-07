import React, { useState } from 'react';
import { Sun, Moon, Flame, Trophy, HelpCircle, Bot, Compass, Activity, BookOpen } from 'lucide-react';
import { HelpModal } from './HelpModal';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  xp: number;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  xp,
  streak,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-15 flex items-center justify-between gap-3">
          {/* Left Zone: Brand & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2.5 text-left cursor-pointer group whitespace-nowrap focus:outline-none"
            >
              {/* Mathematical Icon Badge */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[2.2]">
                  <path d="M3 12h18" strokeDasharray="2 2" strokeOpacity="0.7" />
                  <path d="M12 3v18" strokeDasharray="2 2" strokeOpacity="0.7" />
                  <path d="M4 19c4-1 6-4 7-10" />
                  <path d="M13 15c1-6 3-9 7-10" />
                  <circle cx="12" cy="12" r="2" fill="white" />
                </svg>
              </div>

              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  RATIONAL LAB D
                </span>
                <span className="hidden sm:inline-block ml-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Tâm đối xứng &amp; Cực trị
                </span>
              </div>
            </button>
          </div>

          {/* Center Zone: Quick Jump Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs font-semibold whitespace-nowrap">
            {[
              { id: 'overview', label: 'Tổng quan' },
              { id: 'lab', label: 'Phòng thí nghiệm' },
              { id: 'graph', label: 'Đồ thị' },
              { id: 'symmetry', label: 'Tâm đối xứng' },
              { id: 'extrema', label: 'Cực trị' },
              { id: 'predict', label: 'Thử thách' },
              { id: 'quiz', label: 'Luyện tập' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Zone: Controls & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* AI Tutor Button */}
            <button
              onClick={() => onSelectTab('tutor')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tutor'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-sm shadow-blue-500/20'
                  : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/40'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>

            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              title="Hướng dẫn sử dụng & phím tắt"
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Chuyển sang chế độ sáng (Light Mode)' : 'Chuyển sang chế độ tối (Dark Mode)'}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* User Profile Stats: Streak & XP */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold select-none">
              <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400" title="Chuỗi học tập liên tiếp">
                <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
                <span>{streak}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1 text-blue-600 dark:text-cyan-400" title="Điểm kinh nghiệm tích lũy">
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{xp} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto no-scrollbar px-3 py-1.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950">
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'lab', label: 'Thí nghiệm' },
            { id: 'graph', label: 'Đồ thị' },
            { id: 'symmetry', label: 'Tâm đối xứng' },
            { id: 'extrema', label: 'Cực trị' },
            { id: 'predict', label: 'Dự đoán' },
            { id: 'quiz', label: 'Luyện tập' },
            { id: 'tutor', label: 'AI Tutor' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};
