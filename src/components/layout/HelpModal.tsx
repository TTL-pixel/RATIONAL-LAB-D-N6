import React from 'react';
import { X, BookOpen, MousePointer, Target, Zap, Shield, Sparkles } from 'lucide-react';
import { MathView } from '../math-ui/MathView';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Hướng Dẫn Sử Dụng Rational Lab D
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phòng thí nghiệm tương tác khảo sát hàm số phân thức bậc hai trên bậc nhất
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed no-scrollbar">
          {/* Section 1: Thao tác đồ thị */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <MousePointer className="w-4 h-4" />
              1. Thao tác trên Hệ trục tọa độ tương tác
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Kéo thả chuột (Drag & Pan):</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Nhấp giữ chuột trái và rê chuột để di chuyển vùng nhìn đồ thị.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Cuộn chuột (Zoom In / Out):</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Lăn bánh xe chuột lên/xuống hoặc dùng nút [Zoom +], [Zoom -] trên thanh công cụ.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Nút Fit & Reset:</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Bấm [Fit] để tự động căn chuẩn tâm đối xứng và 2 cực trị vừa vặn màn hình.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Hover điểm đặc biệt:</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Rê chuột vào điểm Cực đại, Cực tiểu, Tâm đối xứng I để xem tọa độ chính xác.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Tâm đối xứng và Cặp P - P' */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-pink-600 dark:text-pink-400">
              <Target className="w-4 h-4" />
              2. Ý nghĩa Tâm đối xứng & Cặp điểm P - P'
            </h3>
            <div className="p-3.5 rounded-xl bg-pink-500/5 dark:bg-pink-950/20 border border-pink-500/20 text-xs space-y-1.5">
              <div>
                • Giao điểm của tiệm cận đứng <MathView math="x = -\frac{q}{p}" /> và tiệm cận xiên <MathView math="y = mx + n" /> chính là <strong>Tâm đối xứng I</strong> của đồ thị.
              </div>
              <div>
                • Khi lấy điểm <MathView math="P(x; y)" /> trên một nhánh đồ thị, điểm đối xứng <MathView math="P'(2x_I - x; 2y_I - y)" /> qua tâm I <strong>luôn nằm trên nhánh còn lại</strong>.
              </div>
              <div>
                • Tâm I luôn là trung điểm của đoạn thẳng nối <MathView math="PP'" />. Tiếp tuyến tại P và P' luôn song song nhau (<MathView math="y'(x_P) = y'(x_{P'})" />).
              </div>
            </div>
          </div>

          {/* Section 3: Gamification & AI Tutor */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
              3. Điểm kinh nghiệm (XP), Chuỗi học tập (Streak) & AI Tutor
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div>• Hoàn thành mỗi thử thách dự đoán hình dáng hoặc trả lời đúng câu hỏi trắc nghiệm sẽ cộng <strong>+20 XP đến +30 XP</strong>.</div>
              <div>• Trả lời đúng liên tiếp sẽ gia tăng <strong>Chuỗi ngày học tập (Streak)</strong>.</div>
              <div>• Nếu gặp bất kỳ công thức hay định lý khó hiểu nào, hãy nhấp vào <strong>"Hỏi Gia Sư AI"</strong> để được trợ giảng giải thích chi tiết từng bước.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            Đã Hiểu &amp; Bắt Đầu
          </button>
        </div>
      </div>
    </div>
  );
};
