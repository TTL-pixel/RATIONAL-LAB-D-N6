import React, { useState } from 'react';
import { RationalAnalysisResult } from '../../types/math';
import { MathView, MathText } from '../math-ui/MathView';
import confetti from 'canvas-confetti';
import { 
  Eye, 
  EyeOff, 
  Award, 
  Check, 
  X, 
  Sparkles, 
  Dices, 
  TrendingUp, 
  Target, 
  Crosshair,
  Compass,
  Activity,
  Layers,
  Split
} from 'lucide-react';

interface PredictionChallengeProps {
  analysis: RationalAnalysisResult;
  hiddenMode: boolean;
  onToggleHiddenMode: () => void;
  onAddXp: (amount: number) => void;
  onRandomizeFunction?: () => void;
}

export type ChallengeType = 
  | 'shape' 
  | 'extrema_paradox' 
  | 'quadrant' 
  | 'intercepts'
  | 'monotonicity'
  | 'asymptotes_slope'
  | 'extrema_position'
  | 'symmetry_points';

export const PredictionChallenge: React.FC<PredictionChallengeProps> = ({
  analysis,
  hiddenMode,
  onToggleHiddenMode,
  onAddXp,
  onRandomizeFunction,
}) => {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeType>('shape');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; explanation: string } | null>(null);

  if (!analysis.isValid) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400">
        Hãy thiết lập hàm số hợp lệ trước khi bắt đầu thử thách dự đoán.
      </div>
    );
  }

  const { coefficients, asymptotes, hasExtrema, extrema, symmetryCenter, intercepts, derivative } = analysis;
  const isPositiveSlope = asymptotes.oblique.m > 0;

  // 1. Logic for Challenge 1: Archetype Shape
  let correctShapeId = 'A';
  if (hasExtrema && isPositiveSlope) correctShapeId = 'A';
  else if (hasExtrema && !isPositiveSlope) correctShapeId = 'B';
  else if (!hasExtrema && isPositiveSlope) correctShapeId = 'C';
  else if (!hasExtrema && !isPositiveSlope) correctShapeId = 'D';

  const shapeArchetypes = [
    {
      id: 'A',
      title: 'Dạng 1: Hai cực trị · TCX dốc lên',
      desc: 'Cực đại ở nhánh trái (x < x₀), cực tiểu ở nhánh phải (x > x₀). Tiệm cận xiên dốc lên (m > 0).',
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-24 stroke-cyan-400 fill-none">
          <line x1="50" y1="0" x2="50" y2="80" stroke="#fb7185" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="10" y1="70" x2="90" y2="10" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
          <path d="M 15 65 Q 35 30 45 68" strokeWidth="2" />
          <circle cx="35" cy="42" r="2.5" fill="#f97316" stroke="none" />
          <path d="M 55 12 Q 65 50 85 15" strokeWidth="2" />
          <circle cx="65" cy="38" r="2.5" fill="#0284c7" stroke="none" />
        </svg>
      ),
    },
    {
      id: 'B',
      title: 'Dạng 2: Hai cực trị · TCX dốc xuống',
      desc: 'Cực tiểu ở nhánh trái (x < x₀), cực đại ở nhánh phải (x > x₀). Tiệm cận xiên dốc xuống (m < 0).',
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-24 stroke-cyan-400 fill-none">
          <line x1="50" y1="0" x2="50" y2="80" stroke="#fb7185" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="10" y1="10" x2="90" y2="70" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
          <path d="M 15 15 Q 35 50 45 12" strokeWidth="2" />
          <circle cx="35" cy="38" r="2.5" fill="#0284c7" stroke="none" />
          <path d="M 55 68 Q 65 30 85 65" strokeWidth="2" />
          <circle cx="65" cy="42" r="2.5" fill="#f97316" stroke="none" />
        </svg>
      ),
    },
    {
      id: 'C',
      title: 'Dạng 3: Không cực trị · Luôn đồng biến',
      desc: 'Hàm số đồng biến trên từng khoảng xác định. Đồ thị không có đỉnh hay đáy uốn lượn.',
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-24 stroke-cyan-400 fill-none">
          <line x1="50" y1="0" x2="50" y2="80" stroke="#fb7185" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="10" y1="70" x2="90" y2="10" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
          <path d="M 15 68 Q 30 55 45 10" strokeWidth="2" />
          <path d="M 55 70 Q 70 25 85 12" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'D',
      title: 'Dạng 4: Không cực trị · Luôn nghịch biến',
      desc: 'Hàm số nghịch biến trên từng khoảng xác định. Hai nhánh đồ thị luôn dốc xuống từ trái sang phải.',
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-24 stroke-cyan-400 fill-none">
          <line x1="50" y1="0" x2="50" y2="80" stroke="#fb7185" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="10" y1="10" x2="90" y2="70" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
          <path d="M 15 12 Q 30 25 45 70" strokeWidth="2" />
          <path d="M 55 10 Q 70 55 85 68" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  // 2. Logic for Challenge 2: Extrema Paradox (yCĐ vs yCT)
  let correctParadoxId = 'none';
  if (!hasExtrema) {
    correctParadoxId = 'none';
  } else {
    const maxPt = extrema.find((e) => e.type === 'max');
    const minPt = extrema.find((e) => e.type === 'min');
    if (maxPt && minPt) {
      if (maxPt.y < minPt.y) correctParadoxId = 'less'; // yCĐ < yCT
      else if (maxPt.y > minPt.y) correctParadoxId = 'greater';
      else correctParadoxId = 'equal';
    }
  }

  const paradoxOptions = [
    {
      id: 'less',
      title: 'yCĐ < yCT (Cực đại nhỏ hơn Cực tiểu)',
      desc: 'Đỉnh cực đại ở nhánh trái có tung độ thấp hơn đáy cực tiểu ở nhánh phải (nghịch lý do tiệm cận đứng phân cách).',
    },
    {
      id: 'greater',
      title: 'yCĐ > yCT (Cực đại lớn hơn Cực tiểu)',
      desc: 'Đỉnh cực đại có tung độ cao hơn đáy cực tiểu như hàm số đa thức bậc 3 thông thường.',
    },
    {
      id: 'equal',
      title: 'yCĐ = yCT (Hai cực trị bằng nhau)',
      desc: 'Điểm cực đại và cực tiểu có cùng tung độ nằm trên một đường thẳng nằm ngang.',
    },
    {
      id: 'none',
      title: 'Hàm số không có điểm cực trị',
      desc: 'Đạo hàm y\' không đổi dấu trên tập xác định (Δ ≤ 0).',
    },
  ];

  // 3. Logic for Challenge 3: Quadrant of Symmetry Center I
  const xI = symmetryCenter.x;
  const yI = symmetryCenter.y;
  let correctQuadrantId = 'I';
  if (Math.abs(xI) < 1e-4 || Math.abs(yI) < 1e-4) {
    correctQuadrantId = 'axis';
  } else if (xI > 0 && yI > 0) {
    correctQuadrantId = 'I';
  } else if (xI < 0 && yI > 0) {
    correctQuadrantId = 'II';
  } else if (xI < 0 && yI < 0) {
    correctQuadrantId = 'III';
  } else {
    correctQuadrantId = 'IV';
  }

  const quadrantOptions = [
    { id: 'I', title: 'Góc phần tư thứ I (+, +)', desc: 'Hoành độ xI > 0 và tung độ yI > 0 (nằm ở phía trên bên phải)' },
    { id: 'II', title: 'Góc phần tư thứ II (-, +)', desc: 'Hoành độ xI < 0 và tung độ yI > 0 (nằm ở phía trên bên trái)' },
    { id: 'III', title: 'Góc phần tư thứ III (-, -)', desc: 'Hoành độ xI < 0 và tung độ yI < 0 (nằm ở phía dưới bên trái)' },
    { id: 'IV', title: 'Góc phần tư thứ IV (+, -)', desc: 'Hoành độ xI > 0 và tung độ yI < 0 (nằm ở phía dưới bên phải)' },
    { id: 'axis', title: 'Nằm ngay trên trục tọa độ Ox hoặc Oy', desc: 'Có ít nhất một tọa độ xI = 0 hoặc yI = 0' },
  ];

  // 4. Logic for Challenge 4: Total Intercepts with Ox and Oy
  const oxCount = intercepts.ox.length;
  const oyCount = intercepts.oy ? 1 : 0;
  const totalIntercepts = oxCount + oyCount;
  const correctInterceptsId = totalIntercepts.toString();

  const interceptOptions = [
    { id: '3', title: '3 giao điểm', desc: 'Đồ thị cắt trục hoành Ox tại 2 điểm và cắt trục tung Oy tại 1 điểm' },
    { id: '2', title: '2 giao điểm', desc: 'Đồ thị có 2 giao điểm với các trục tọa độ' },
    { id: '1', title: '1 giao điểm', desc: 'Đồ thị chỉ cắt duy nhất một trục tọa độ (thường là trục Oy)' },
    { id: '0', title: '0 giao điểm', desc: 'Đồ thị không bao giờ cắt bất kỳ trục tọa độ nào' },
  ];

  // 5. Logic for Challenge 5: Monotonicity behavior
  let correctMonoId = 'increase_outer';
  if (hasExtrema) {
    if (derivative.A > 0) {
      correctMonoId = 'increase_outer'; // Đồng biến ngoài 2 nghiệm, nghịch biến giữa
    } else {
      correctMonoId = 'decrease_outer'; // Nghịch biến ngoài 2 nghiệm, đồng biến giữa
    }
  } else {
    if (derivative.A > 0) {
      correctMonoId = 'always_inc'; // Đồng biến trên từng khoảng xác định
    } else {
      correctMonoId = 'always_dec'; // Nghịch biến trên từng khoảng xác định
    }
  }

  const monoOptions = [
    {
      id: 'increase_outer',
      title: 'Đồng biến ở 2 nhánh ngoài, nghịch biến ở giữa',
      desc: 'Hàm số đồng biến trên (-∞; x₁) và (x₂; +∞); nghịch biến trên (x₁; x₀) và (x₀; x₂).',
    },
    {
      id: 'decrease_outer',
      title: 'Nghịch biến ở 2 nhánh ngoài, đồng biến ở giữa',
      desc: 'Hàm số nghịch biến trên (-∞; x₁) và (x₂; +∞); đồng biến trên (x₁; x₀) và (x₀; x₂).',
    },
    {
      id: 'always_inc',
      title: 'Đồng biến trên từng khoảng xác định',
      desc: 'Đạo hàm y\' > 0 với mọi x ≠ x₀ (hàm số không có cực trị).',
    },
    {
      id: 'always_dec',
      title: 'Nghịch biến trên từng khoảng xác định',
      desc: 'Đạo hàm y\' < 0 với mọi x ≠ x₀ (hàm số không có cực trị).',
    },
  ];

  // 6. Logic for Challenge 6: Asymptote Slopes & Angles
  const mVal = asymptotes.oblique.m;
  let correctSlopeId = 'steep_pos';
  if (mVal > 1) correctSlopeId = 'steep_pos';
  else if (mVal > 0 && mVal <= 1) correctSlopeId = 'gentle_pos';
  else if (mVal < -1) correctSlopeId = 'steep_neg';
  else correctSlopeId = 'gentle_neg';

  const slopeOptions = [
    {
      id: 'steep_pos',
      title: 'Dốc đứng theo hướng dương (m > 1)',
      desc: `Hệ số góc m = ${mVal.toFixed(2)} > 1: Tiệm cận xiên tạo với trục hoành góc lớn hơn 45° (góc nhọn lớn).`,
    },
    {
      id: 'gentle_pos',
      title: 'Thoai thoải theo hướng dương (0 < m ≤ 1)',
      desc: `Hệ số góc m = ${mVal.toFixed(2)}: Tiệm cận xiên dốc vừa phải, tạo với trục hoành góc nhọn ≤ 45°.`,
    },
    {
      id: 'steep_neg',
      title: 'Dốc đứng theo hướng âm (m < -1)',
      desc: `Hệ số góc m = ${mVal.toFixed(2)} < -1: Tiệm cận xiên dốc cắm xuống, tạo với trục Ox góc tù lớn.`,
    },
    {
      id: 'gentle_neg',
      title: 'Thoai thoải theo hướng âm (-1 ≤ m < 0)',
      desc: `Hệ số góc m = ${mVal.toFixed(2)}: Tiệm cận xiên đi xuống thoai thoải, tạo với Ox góc tù gần 180°.`,
    },
  ];

  // 7. Logic for Challenge 7: Relative Extrema Placement
  let correctPlacementId = 'opposite';
  if (!hasExtrema) {
    correctPlacementId = 'none';
  } else {
    const x1 = extrema[0].x;
    const x2 = extrema[1].x;
    if (x1 * x2 < -1e-5) {
      correctPlacementId = 'opposite'; // Nằm về hai phía của trục tung Oy (x1 < 0 < x2)
    } else if (x1 > 0 && x2 > 0) {
      correctPlacementId = 'right'; // Cùng nằm bên phải trục Oy
    } else {
      correctPlacementId = 'left'; // Cùng nằm bên trái trục Oy
    }
  }

  const placementOptions = [
    {
      id: 'opposite',
      title: 'Hai điểm cực trị nằm về hai phía của trục tung Oy',
      desc: 'Tích hoành độ cực trị x₁·x₂ < 0: Một điểm cực trị có hoành độ âm, một điểm có hoành độ dương.',
    },
    {
      id: 'right',
      title: 'Cả hai điểm cực trị cùng nằm bên phải trục tung Oy',
      desc: 'Cả hai điểm cực trị đều có hoành độ dương (x₁ > 0 và x₂ > 0).',
    },
    {
      id: 'left',
      title: 'Cả hai điểm cực trị cùng nằm bên trái trục tung Oy',
      desc: 'Cả hai điểm cực trị đều có hoành độ âm (x₁ < 0 và x₂ < 0).',
    },
    {
      id: 'none',
      title: 'Hàm số không có điểm cực trị nào',
      desc: 'Phương trình y\' = 0 không có 2 nghiệm phân biệt.',
    },
  ];

  // 8. Logic for Challenge 8: Symmetry Properties of P and P'
  const correctSymmetryId = 'equal_slopes';
  const symmetryOptions = [
    {
      id: 'equal_slopes',
      title: 'Tiếp tuyến tại P và P\' luôn song song (y\'(x_P) = y\'(x_P\'))',
      desc: 'Qua phép đối xứng tâm I, tiếp tuyến tại P biến thành tiếp tuyến tại P\', nên hai tiếp tuyến luôn cùng hệ số góc k.',
    },
    {
      id: 'perp_slopes',
      title: 'Tiếp tuyến tại P và P\' luôn vuông góc (y\'(x_P) · y\'(x_P\') = -1)',
      desc: 'Hai tiếp tuyến cắt nhau tại tâm đối xứng I và vuông góc với nhau.',
    },
    {
      id: 'opposite_slopes',
      title: 'Tiếp tuyến tại P và P\' có hệ số góc đối nhau (y\'(x_P) = -y\'(x_P\'))',
      desc: 'Một tiếp tuyến dốc lên và một tiếp tuyến dốc xuống đối xứng qua trục tung.',
    },
    {
      id: 'random_slopes',
      title: 'Hệ số góc tại P và P\' không có bất kỳ mối liên hệ nào',
      desc: 'Độ dốc tiếp tuyến thay đổi tùy ý không phụ thuộc vào tâm đối xứng I.',
    },
  ];

  // Active items and target
  let currentTargetId = correctShapeId;
  if (activeChallenge === 'extrema_paradox') currentTargetId = correctParadoxId;
  else if (activeChallenge === 'quadrant') currentTargetId = correctQuadrantId;
  else if (activeChallenge === 'intercepts') currentTargetId = correctInterceptsId;
  else if (activeChallenge === 'monotonicity') currentTargetId = correctMonoId;
  else if (activeChallenge === 'asymptotes_slope') currentTargetId = correctSlopeId;
  else if (activeChallenge === 'extrema_position') currentTargetId = correctPlacementId;
  else if (activeChallenge === 'symmetry_points') currentTargetId = correctSymmetryId;

  const handleVerify = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentTargetId;
    setHasEvaluated(true);

    if (isCorrect) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
      onAddXp(30);

      let expl = '';
      if (activeChallenge === 'shape') {
        expl = `Dựa vào tiệm cận xiên hệ số góc m = ${asymptotes.oblique.m.toFixed(2)} và số cực trị (${hasExtrema ? '2 cực trị' : '0 cực trị'}), đồ thị mang hình dạng Dạng ${correctShapeId}.`;
      } else if (activeChallenge === 'extrema_paradox') {
        expl = hasExtrema 
          ? `Đường thẳng nối 2 cực trị có hệ số góc k = 2a/p = ${(2 * coefficients.a / coefficients.p).toFixed(2)}. ${correctParadoxId === 'less' ? 'Vì k > 0 và xCĐ < xCT nên yCĐ < yCT. Đây là nghịch lý kinh điển trong đề thi THPT!' : 'Vì k < 0 nên yCĐ > yCT.'}`
          : 'Hàm số có Δ ≤ 0 nên không có cực trị.';
      } else if (activeChallenge === 'quadrant') {
        expl = `Tâm đối xứng I có tọa độ (${symmetryCenter.x.toFixed(2)}; ${symmetryCenter.y.toFixed(2)}), nằm chính xác ở ${quadrantOptions.find((q) => q.id === correctQuadrantId)?.title}.`;
      } else if (activeChallenge === 'intercepts') {
        expl = `Tử thức có ${oxCount} nghiệm thực trên Ox, và tại x = 0 hàm số có ${oyCount} giao điểm trên Oy. Tổng cộng là ${totalIntercepts} giao điểm.`;
      } else if (activeChallenge === 'monotonicity') {
        expl = hasExtrema
          ? `Tử số đạo hàm có hệ số A = a·p = ${derivative.A}. Vì ${derivative.A > 0 ? 'A > 0 nên y\' mang dấu (+) ngoài 2 nghiệm và (-) ở giữa' : 'A < 0 nên y\' mang dấu (-) ngoài 2 nghiệm và (+) ở giữa'}.`
          : `Đạo hàm không đổi dấu vì biệt thức Δ = ${derivative.delta.toFixed(1)} ≤ 0. Hàm số ${derivative.A > 0 ? 'đồng biến' : 'nghịch biến'} trên từng khoảng xác định.`;
      } else if (activeChallenge === 'asymptotes_slope') {
        expl = `Tiệm cận xiên y = ${asymptotes.oblique.exactM}x + ${asymptotes.oblique.exactN} có hệ số góc m = ${mVal.toFixed(2)}. Do đó tiệm cận xiên thuộc dạng ${slopeOptions.find((s) => s.id === correctSlopeId)?.title}.`;
      } else if (activeChallenge === 'extrema_position') {
        expl = hasExtrema
          ? `Hoành độ 2 điểm cực trị là x₁ ≈ ${extrema[0].x.toFixed(2)} và x₂ ≈ ${extrema[1].x.toFixed(2)}. Tích x₁·x₂ = ${extrema[0].x * extrema[1].x > 0 ? '> 0' : '< 0'}, do đó ${placementOptions.find((p) => p.id === correctPlacementId)?.title}.`
          : 'Hàm số không có cực trị nên không xét vị trí 2 cực trị.';
      } else if (activeChallenge === 'symmetry_points') {
        expl = `Vì I là tâm đối xứng của đồ thị hàm phân thức, phép đối xứng tâm I biến tiếp tuyến tại P thành tiếp tuyến tại P\'. Phép đối xứng tâm bảo toàn phương của đường thẳng, do đó hai tiếp tuyến luôn song song và có cùng hệ số góc: y\'(x_P) = y\'(x_P\').`;
      }

      setFeedback({ 
        isCorrect: true, 
        message: 'Xuất sắc! Bạn đã dự đoán hoàn toàn chính xác!', 
        explanation: expl 
      });
    } else {
      let expl = '';
      if (activeChallenge === 'shape') {
        expl = `Hình dạng chuẩn xác là Dạng ${correctShapeId}.`;
      } else if (activeChallenge === 'extrema_paradox') {
        expl = `Đáp án đúng là: ${paradoxOptions.find((p) => p.id === correctParadoxId)?.title}.`;
      } else if (activeChallenge === 'quadrant') {
        expl = `Tọa độ tâm đối xứng I là (${symmetryCenter.x.toFixed(2)}; ${symmetryCenter.y.toFixed(2)}), thuộc ${quadrantOptions.find((q) => q.id === correctQuadrantId)?.title}.`;
      } else if (activeChallenge === 'intercepts') {
        expl = `Đồ thị có ${totalIntercepts} giao điểm (${oxCount} trên Ox, ${oyCount} trên Oy).`;
      } else if (activeChallenge === 'monotonicity') {
        expl = `Đáp án đúng là: ${monoOptions.find((m) => m.id === correctMonoId)?.title}.`;
      } else if (activeChallenge === 'asymptotes_slope') {
        expl = `Hệ số góc tiệm cận xiên m = a/p = ${mVal.toFixed(2)}, thuộc dạng: ${slopeOptions.find((s) => s.id === correctSlopeId)?.title}.`;
      } else if (activeChallenge === 'extrema_position') {
        expl = `Đáp án đúng là: ${placementOptions.find((p) => p.id === correctPlacementId)?.title}.`;
      } else if (activeChallenge === 'symmetry_points') {
        expl = `Đáp án đúng là: Tiếp tuyến tại P và P\' luôn song song vì tâm I là trung điểm PP\' và phép đối xứng tâm bảo toàn độ dốc tiếp tuyến.`;
      }

      setFeedback({
        isCorrect: false,
        message: 'Chưa chính xác! Hãy đọc kỹ các dữ kiện toán học gợi ý bên dưới.',
        explanation: expl,
      });
    }

    // Automatically reveal graph if hidden so user can verify visually!
    if (hiddenMode) {
      onToggleHiddenMode();
    }
  };

  const handleSwitchChallenge = (type: ChallengeType) => {
    setActiveChallenge(type);
    setSelectedOption(null);
    setHasEvaluated(false);
    setFeedback(null);
  };

  const handleResetChallenge = () => {
    setSelectedOption(null);
    setHasEvaluated(false);
    setFeedback(null);
    if (!hiddenMode) {
      onToggleHiddenMode();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-5 transition-colors">
      {/* Header and Toggle Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            THỬ THÁCH DỰ ĐOÁN HÌNH DẠNG &amp; ĐẶC TRƯNG HÀM SỐ
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Đọc vị đồ thị từ các dữ kiện giải tích trước khi kiểm tra hình ảnh thực tế
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRandomizeFunction && (
            <button
              onClick={() => {
                onRandomizeFunction();
                handleResetChallenge();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-cyan-500/10 hover:bg-blue-100 dark:hover:bg-cyan-500/20 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Đổi hàm số khác</span>
            </button>
          )}

          <button
            onClick={onToggleHiddenMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              hiddenMode
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {hiddenMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{hiddenMode ? 'Đang ẩn đồ thị' : 'Đang hiện đồ thị'}</span>
          </button>
        </div>
      </div>

      {/* Challenge Category Selector Tabs (8 Diverse Categories) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => handleSwitchChallenge('shape')}
          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
            activeChallenge === 'shape'
              ? 'bg-cyan-50 dark:bg-cyan-500/15 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="truncate">1. Dáng điệu đồ thị</span>
        </button>

        <button
          onClick={() => handleSwitchChallenge('extrema_paradox')}
          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
            activeChallenge === 'extrema_paradox'
              ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="truncate">2. So sánh yCĐ &amp; yCT</span>
        </button>

        <button
          onClick={() => handleSwitchChallenge('quadrant')}
          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
            activeChallenge === 'quadrant'
              ? 'bg-pink-50 dark:bg-pink-500/15 border-pink-300 dark:border-pink-500/40 text-pink-700 dark:text-pink-300 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <Target className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
          <span className="truncate">3. Vị trí Tâm đối xứng</span>
        </button>

        <button
          onClick={() => handleSwitchChallenge('intercepts')}
          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
            activeChallenge === 'intercepts'
              ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <Crosshair className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">4. Giao điểm với các trục</span>
        </button>

        <button
          onClick={() => handleSwitchChallenge('monotonicity')}
          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
            activeChallenge === 'monotonicity'
              ? 'bg-purple-50 dark:bg-purple-500/15 border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="truncate">5. Chiều biến thiên</span>
        </button>

        <button
          onClick={() => handleSwitchChallenge('asymptotes_slope')}
          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
            activeChallenge === 'asymptotes_slope'
              ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-300 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <Split className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="truncate">6. Độ dốc tiệm cận xiên</span>
        </button>

        <button
          onClick={() => handleSwitchChallenge('extrema_position')}
          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
            activeChallenge === 'extrema_position'
              ? 'bg-orange-50 dark:bg-orange-500/15 border-orange-300 dark:border-orange-500/40 text-orange-700 dark:text-orange-300 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <Crosshair className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
          <span className="truncate">7. Vị trí 2 cực trị vs Oy</span>
        </button>

        <button
          onClick={() => handleSwitchChallenge('symmetry_points')}
          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
            activeChallenge === 'symmetry_points'
              ? 'bg-yellow-50 dark:bg-yellow-500/15 border-yellow-300 dark:border-yellow-500/40 text-yellow-700 dark:text-yellow-300 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <span className="truncate">8. Đối xứng cặp P &amp; P'</span>
        </button>
      </div>

      {/* Clues Summary Cards */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
        <div className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          DỮ KIỆN TOÁN HỌC GỢI Ý CHO HÀM SỐ HIỆN TẠI:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">Tiệm cận đứng</div>
            <div className="font-mono text-rose-500 dark:text-rose-400 font-semibold mt-0.5">
              <MathView math={analysis.asymptotes.vertical.equation} />
            </div>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">Tiệm cận xiên</div>
            <div className="font-mono text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
              <MathView math={analysis.asymptotes.oblique.equation} />
            </div>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">Biệt thức tử số y'</div>
            <div className="font-mono text-amber-600 dark:text-amber-400 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
              <MathView math={`\\Delta = ${derivative.delta.toFixed(1)}`} />
              <span className="text-[11px] font-sans">({hasExtrema ? 'Có 2 cực trị' : 'Không có cực trị'})</span>
            </div>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">Tâm đối xứng</div>
            <div className="font-mono text-pink-600 dark:text-pink-400 font-semibold mt-0.5">
              <MathView math={analysis.symmetryCenter.latex} />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content According to Active Challenge */}
      <div className="space-y-3">
        {/* Challenge 1: Archetypes */}
        {activeChallenge === 'shape' && (
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2.5">
              Dựa vào tiệm cận xiên và số lượng cực trị, hãy chọn hình dạng đồ thị đúng nhất:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {shapeArchetypes.map((arch) => {
                const isSelected = selectedOption === arch.id;
                const isTarget = arch.id === correctShapeId;
                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40';

                if (isSelected) borderStyle = 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500';
                if (hasEvaluated) {
                  if (isTarget) borderStyle = 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500';
                  else if (isSelected && !isTarget) borderStyle = 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500';
                  else borderStyle = 'border-slate-800 bg-slate-950/40 opacity-50';
                }

                return (
                  <div
                    key={arch.id}
                    onClick={() => !hasEvaluated && setSelectedOption(arch.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${borderStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-white">{arch.title}</span>
                        {hasEvaluated && isTarget && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasEvaluated && isSelected && !isTarget && (
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="bg-slate-900/80 rounded border border-slate-800/80 p-1 mb-2">
                        {arch.svg}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{arch.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge 2: Paradox */}
        {activeChallenge === 'extrema_paradox' && (
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2.5">
              So sánh tung độ điểm Cực đại (yCĐ) và Cực tiểu (yCT) của hàm số này:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paradoxOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isTarget = opt.id === correctParadoxId;
                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40';

                if (isSelected) borderStyle = 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500';
                if (hasEvaluated) {
                  if (isTarget) borderStyle = 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500';
                  else if (isSelected && !isTarget) borderStyle = 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500';
                  else borderStyle = 'border-slate-800 bg-slate-950/40 opacity-50';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasEvaluated && setSelectedOption(opt.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${borderStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                        {hasEvaluated && isTarget && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasEvaluated && isSelected && !isTarget && (
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge 3: Quadrant */}
        {activeChallenge === 'quadrant' && (
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2.5">
              Dựa vào tọa độ xI = -q/p và yI, tâm đối xứng I nằm ở góc phần tư thứ mấy?
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quadrantOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isTarget = opt.id === correctQuadrantId;
                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40';

                if (isSelected) borderStyle = 'border-pink-500 bg-pink-950/20 ring-1 ring-pink-500';
                if (hasEvaluated) {
                  if (isTarget) borderStyle = 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500';
                  else if (isSelected && !isTarget) borderStyle = 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500';
                  else borderStyle = 'border-slate-800 bg-slate-950/40 opacity-50';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasEvaluated && setSelectedOption(opt.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${borderStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                        {hasEvaluated && isTarget && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasEvaluated && isSelected && !isTarget && (
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge 4: Intercepts */}
        {activeChallenge === 'intercepts' && (
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2.5">
              Đồ thị hàm số này cắt 2 trục tọa độ Ox và Oy tại tổng cộng bao nhiêu giao điểm?
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interceptOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isTarget = opt.id === correctInterceptsId;
                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40';

                if (isSelected) borderStyle = 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500';
                if (hasEvaluated) {
                  if (isTarget) borderStyle = 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500';
                  else if (isSelected && !isTarget) borderStyle = 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500';
                  else borderStyle = 'border-slate-800 bg-slate-950/40 opacity-50';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasEvaluated && setSelectedOption(opt.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${borderStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                        {hasEvaluated && isTarget && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasEvaluated && isSelected && !isTarget && (
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge 5: Monotonicity */}
        {activeChallenge === 'monotonicity' && (
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2.5">
              Dựa vào dấu của đạo hàm y', hãy dự đoán chiều biến thiên của hàm số trên các khoảng xác định:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {monoOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isTarget = opt.id === correctMonoId;
                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40';

                if (isSelected) borderStyle = 'border-purple-500 bg-purple-950/20 ring-1 ring-purple-500';
                if (hasEvaluated) {
                  if (isTarget) borderStyle = 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500';
                  else if (isSelected && !isTarget) borderStyle = 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500';
                  else borderStyle = 'border-slate-800 bg-slate-950/40 opacity-50';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasEvaluated && setSelectedOption(opt.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${borderStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                        {hasEvaluated && isTarget && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasEvaluated && isSelected && !isTarget && (
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge 6: Asymptote Slopes */}
        {activeChallenge === 'asymptotes_slope' && (
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2.5">
              Hệ số góc m = a/p của tiệm cận xiên mang đặc trưng độ dốc và hướng đi nào?
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slopeOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isTarget = opt.id === correctSlopeId;
                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40';

                if (isSelected) borderStyle = 'border-sky-500 bg-sky-950/20 ring-1 ring-sky-500';
                if (hasEvaluated) {
                  if (isTarget) borderStyle = 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500';
                  else if (isSelected && !isTarget) borderStyle = 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500';
                  else borderStyle = 'border-slate-800 bg-slate-950/40 opacity-50';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasEvaluated && setSelectedOption(opt.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${borderStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                        {hasEvaluated && isTarget && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasEvaluated && isSelected && !isTarget && (
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge 7: Extrema Placement */}
        {activeChallenge === 'extrema_position' && (
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2.5">
              Dựa vào dấu của hoành độ 2 điểm cực trị, vị trí tương đối của chúng đối với trục tung Oy là:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {placementOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isTarget = opt.id === correctPlacementId;
                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40';

                if (isSelected) borderStyle = 'border-orange-500 bg-orange-950/20 ring-1 ring-orange-500';
                if (hasEvaluated) {
                  if (isTarget) borderStyle = 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500';
                  else if (isSelected && !isTarget) borderStyle = 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500';
                  else borderStyle = 'border-slate-800 bg-slate-950/40 opacity-50';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasEvaluated && setSelectedOption(opt.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${borderStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                        {hasEvaluated && isTarget && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasEvaluated && isSelected && !isTarget && (
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge 8: Symmetry Points P & P' */}
        {activeChallenge === 'symmetry_points' && (
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2.5">
              Với cặp điểm P và P' trên đồ thị đối xứng nhau qua tâm I, mối liên hệ giữa các tiếp tuyến tại P và P' là:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {symmetryOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isTarget = opt.id === correctSymmetryId;
                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40';

                if (isSelected) borderStyle = 'border-yellow-500 bg-yellow-950/20 ring-1 ring-yellow-500';
                if (hasEvaluated) {
                  if (isTarget) borderStyle = 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500';
                  else if (isSelected && !isTarget) borderStyle = 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500';
                  else borderStyle = 'border-slate-800 bg-slate-950/40 opacity-50';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasEvaluated && setSelectedOption(opt.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${borderStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                        {hasEvaluated && isTarget && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasEvaluated && isSelected && !isTarget && (
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Verify Button and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400">
          {!hasEvaluated ? (
            <span>Chọn 1 đáp án và nhấn kiểm tra. Đồ thị sẽ tự động hiện lên để đối chiếu trực quan.</span>
          ) : (
            <span>Đã kiểm tra kết quả! Bạn có thể thử thách các dạng câu hỏi khác ở trên.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasEvaluated && (
            <button
              onClick={handleResetChallenge}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Làm lại thử thách này
            </button>
          )}

          <button
            onClick={handleVerify}
            disabled={!selectedOption || hasEvaluated}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              selectedOption && !hasEvaluated
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white cursor-pointer shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Kiểm Tra Dự Đoán (+30 XP)</span>
          </button>
        </div>
      </div>

      {/* Feedback & Mathematical Explanation Card */}
      {feedback && (
        <div
          className={`p-4 sm:p-5 rounded-xl border space-y-2.5 animate-fadeIn text-xs leading-relaxed ${
            feedback.isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="font-bold flex items-center gap-2 text-sm">
            {feedback.isCorrect ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <X className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <div className="text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
            <strong className="text-slate-900 dark:text-white">Phân tích cơ sở toán học:</strong>
            <MathText text={feedback.explanation} />
          </div>
        </div>
      )}
    </div>
  );
};
