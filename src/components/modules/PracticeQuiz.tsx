import React, { useState, useEffect } from 'react';
import { FunctionCoefficients } from '../../types/math';
import { analyzeRationalFunction, evaluateRational } from '../../math/rationalFunction';
import { formatDecimal, formatFraction } from '../../math/fraction';
import { MathView, MathText } from '../math-ui/MathView';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  Award,
  RotateCcw
} from 'lucide-react';

function formatQuizOption(opt: string): string {
  if (!opt) return '';
  const trimmed = opt.trim();
  if (trimmed.startsWith('$') || trimmed.startsWith('\\(') || trimmed.startsWith('\\[') || trimmed.startsWith('$$')) {
    return trimmed;
  }
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(trimmed);
  if (!hasVietnamese && (trimmed.includes('\\') || trimmed.includes('=') || trimmed.includes('^') || trimmed.includes('_') || trimmed.includes('(') || trimmed.includes(')') || trimmed.includes('{'))) {
    return `$${trimmed}$`;
  }
  return trimmed;
}

interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface PracticeQuizProps {
  currentCoeffs: FunctionCoefficients;
  onAddXp: (amount: number) => void;
  streak: number;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
}

export const PracticeQuiz: React.FC<PracticeQuizProps> = ({
  currentCoeffs: _currentCoeffs,
  onAddXp,
  streak,
  onIncrementStreak,
  onResetStreak,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Generate a random question based on curriculum types
  const generateQuestion = (): QuizQuestion => {
    // Pick random non-degenerate coefficients
    const aList = [1, 2, -1, -2, 3];
    const bList = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    const cList = [-5, -4, -2, -1, 1, 2, 3, 5];
    const pList = [1, -1, 2];
    const qList = [-3, -2, -1, 1, 2, 3];

    const a = aList[Math.floor(Math.random() * aList.length)];
    const b = bList[Math.floor(Math.random() * bList.length)];
    const c = cList[Math.floor(Math.random() * cList.length)];
    const p = pList[Math.floor(Math.random() * pList.length)];
    const q = qList[Math.floor(Math.random() * qList.length)];

    const coeffs = { a, b, c, p, q };
    const analysis = analyzeRationalFunction(coeffs);

    if (!analysis.isValid) {
      return generateQuestion(); // Retry until valid
    }

    const type = Math.floor(Math.random() * 15);

    // Type 0: Tiệm cận đứng
    if (type === 0) {
      const correct = analysis.asymptotes.vertical.equation;
      const fake1 = `x = ${analysis.asymptotes.oblique.exactN}`;
      const fake2 = `y = ${analysis.excludedPointExact}`;
      const fake3 = `x = ${formatFraction(q, p)}`;
      const options = shuffle([correct, fake1, fake2, fake3]);
      const pSign = q >= 0 ? `+ ${q}` : `- ${Math.abs(q)}`;
      const pExpr = p === 1 ? `x ${pSign}` : p === -1 ? `-x ${pSign}` : `${p}x ${pSign}`;
      return {
        id: Date.now() + Math.random(),
        category: 'Tiệm cận đứng',
        question: `Tìm phương trình đường tiệm cận đứng của đồ thị hàm số: $${analysis.latexFormula}$`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Tiệm cận đứng là nghiệm của mẫu số làm mẫu số bằng 0 và tử số khác 0.\n• Giải phương trình: $${pExpr} = 0 \\iff x = ${analysis.excludedPointExact}$.\n• Vậy phương trình tiệm cận đứng là $${correct}$.`,
      };
    }

    // Type 1: Tiệm cận xiên
    if (type === 1) {
      const correct = analysis.asymptotes.oblique.equation;
      const fake1 = `y = ${coeffs.a}x + ${coeffs.b}`;
      const fake2 = `y = ${analysis.asymptotes.oblique.exactM}x`;
      const fake3 = `y = ${analysis.asymptotes.oblique.exactM}x - ${analysis.asymptotes.oblique.exactN}`;
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Tiệm cận xiên',
        question: `Tìm phương trình đường tiệm cận xiên của đồ thị hàm số: $${analysis.latexFormula}$`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Thực hiện phép chia đa thức tử cho mẫu:\n$${analysis.asymptotes.oblique.divisionStepsLatex}$\n• Khi $x \\to \\pm\\infty$, phần dư triệt tiêu dần về 0: $\\lim_{x \\to \\pm\\infty} [y - (${analysis.asymptotes.oblique.equation.replace('y = ', '')})] = 0$.\n• Vậy phương trình tiệm cận xiên là $${correct}$.`,
      };
    }

    // Type 2: Tâm đối xứng I
    if (type === 2) {
      const correct = analysis.symmetryCenter.latex;
      const fake1 = `I(${analysis.symmetryCenter.exactY}; ${analysis.symmetryCenter.exactX})`;
      const fake2 = `I(0; ${analysis.symmetryCenter.exactY})`;
      const fake3 = `I(${analysis.symmetryCenter.exactX}; 0)`;
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Tâm đối xứng',
        question: `Tâm đối xứng $I$ của đồ thị hàm số $${analysis.latexFormula}$ có tọa độ là:`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Tâm đối xứng $I$ của đồ thị hàm phân thức là giao điểm của tiệm cận đứng ($${analysis.asymptotes.vertical.equation}$) và tiệm cận xiên ($${analysis.asymptotes.oblique.equation}$).\n• Hoành độ: $x_I = ${analysis.symmetryCenter.exactX}$.\n• Thay $x_I$ vào phương trình tiệm cận xiên: $y_I = ${analysis.symmetryCenter.exactY}$.\n• Vậy tọa độ tâm đối xứng là $${correct}$.`,
      };
    }

    // Type 3: Tập xác định
    if (type === 3) {
      const correct = analysis.domainLatex;
      const fake1 = `D = \\mathbb{R}`;
      const fake2 = `D = \\mathbb{R} \\setminus \\left\\{ ${analysis.asymptotes.oblique.exactM} \\right\\}`;
      const fake3 = `D = (${analysis.excludedPointExact}; +\\infty)`;
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Tập xác định',
        question: `Tìm tập xác định $D$ của hàm số: $${analysis.latexFormula}$`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Hàm số phân thức xác định khi và chỉ khi mẫu số khác 0.\n• Điều kiện: $${coeffs.p}x + (${coeffs.q}) \\neq 0 \\iff x \\neq ${analysis.excludedPointExact}$.\n• Do đó tập xác định của hàm số là $${correct}$.`,
      };
    }

    // Type 4: Số điểm cực trị
    if (type === 4) {
      const correct = analysis.hasExtrema ? '2 điểm cực trị' : 'Không có cực trị';
      const fake1 = analysis.hasExtrema ? 'Không có cực trị' : '2 điểm cực trị';
      const fake2 = '1 điểm cực trị';
      const fake3 = '3 điểm cực trị';
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Số điểm cực trị',
        question: `Hàm số $${analysis.latexFormula}$ có bao nhiêu điểm cực trị?`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: analysis.hasExtrema
          ? `• Tử thức của đạo hàm $y'$ là tam thức bậc hai có biệt thức $\\Delta = ${analysis.derivative.delta.toFixed(1)} > 0$.\n• Phương trình $y' = 0$ có 2 nghiệm phân biệt và $y'$ đổi dấu qua 2 nghiệm đó.\n• Do đó hàm số có đúng 2 điểm cực trị (1 cực đại và 1 cực tiểu).`
          : `• Tử thức của đạo hàm $y'$ có biệt thức $\\Delta = ${analysis.derivative.delta.toFixed(1)} \\le 0$.\n• Phương trình $y' = 0$ vô nghiệm hoặc có nghiệm kép, do đó đạo hàm không đổi dấu trên các khoảng xác định.\n• Do đó hàm số không có cực trị.`,
      };
    }

    // Type 5: Đường thẳng qua 2 điểm cực trị
    if (type === 5) {
      if (analysis.hasExtrema) {
        const correct = analysis.extremaLineEquation || `y = ${(2 * coeffs.a) / coeffs.p}x + ${coeffs.b / coeffs.p}`;
        const fake1 = `y = ${coeffs.a}x + ${coeffs.b}`;
        const fake2 = `y = ${coeffs.b}x + ${coeffs.c}`;
        const fake3 = `y = 2x + 1`;
        const options = shuffle([correct, fake1, fake2, fake3]);
        return {
          id: Date.now() + Math.random(),
          category: 'Đường thẳng qua 2 cực trị',
          question: `Phương trình đường thẳng đi qua hai điểm cực trị của đồ thị hàm số $${analysis.latexFormula}$ là:`,
          options,
          correctIndex: options.indexOf(correct),
          explanation: `• Áp dụng công thức giải nhanh SGK Giải tích 12:\nĐường thẳng đi qua 2 điểm cực trị có phương trình: $y = \\frac{u'(x)}{v'(x)} = \\frac{2ax + b}{p}$.\n• Thay hệ số $a = ${coeffs.a}, b = ${coeffs.b}, p = ${coeffs.p}$ ta được:\n$${correct}$.`,
        };
      }
    }

    // Type 6: Giao điểm trục Oy
    if (type === 6) {
      const correct = analysis.intercepts.oy
        ? `(0; ${analysis.intercepts.oy.exactY || formatDecimal(analysis.intercepts.oy.y, 2)})`
        : 'Không cắt trục Oy';
      const fake1 = `(0; ${coeffs.c})`;
      const fake2 = `(${analysis.excludedPointExact}; 0)`;
      const fake3 = `(1; 0)`;
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Giao điểm trục Oy',
        question: `Tọa độ giao điểm của đồ thị hàm số $${analysis.latexFormula}$ với trục tung Oy là:`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Giao điểm với trục tung $Oy$ ứng với hoành độ $x = 0$.\n• Thay $x = 0$ vào hàm số:\n$y = \\frac{${coeffs.a}(0)^2 + ${coeffs.b}(0) + ${coeffs.c}}{${coeffs.p}(0) + ${coeffs.q}} = ${analysis.intercepts.oy ? analysis.intercepts.oy.exactY : '\\text{không xác định}'}$.\n• Vậy tọa độ giao điểm với trục Oy là $${correct}$.`,
      };
    }

    // Type 7: Đạo hàm y'
    if (type === 7) {
      const correct = analysis.derivative.simplifiedLatex;
      const fake1 = `y' = \\frac{${coeffs.a}x^2 + ${coeffs.c}}{(${coeffs.p}x + ${coeffs.q})^2}`;
      const fake2 = `y' = \\frac{2x + 1}{(${coeffs.p}x + ${coeffs.q})^2}`;
      const fake3 = `y' = \\frac{${coeffs.a}x + ${coeffs.b}}{${coeffs.p}}`;
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Đạo hàm',
        question: `Đạo hàm rút gọn của hàm số $${analysis.latexFormula}$ là:`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Áp dụng quy tắc đạo hàm phân thức: $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$.\n• Khai triển tử số: $(2ax + b)(px + q) - p(ax^2 + bx + c) = ap x^2 + 2aq x + (bq - cp)$.\n• Rút gọn ta được công thức đạo hàm chuẩn xác: $${correct}$.`,
      };
    }

    // Type 8: Khoảng đồng biến / nghịch biến
    if (type === 8) {
      if (analysis.increasingIntervals.length > 0) {
        const correct = analysis.increasingIntervals[0];
        const fake1 = analysis.decreasingIntervals[0] || `(-\\infty; +\\infty)`;
        const fake2 = `(-\\infty; +\\infty)`;
        const fake3 = `\\mathbb{R} \\setminus \\left\\{ ${analysis.excludedPointExact} \\right\\}`;
        const options = shuffle([correct, fake1, fake2, fake3]);
        return {
          id: Date.now() + Math.random(),
          category: 'Khoảng đồng biến',
          question: `Khoảng nào dưới đây là một khoảng đồng biến của hàm số $${analysis.latexFormula}$?`,
          options,
          correctIndex: options.indexOf(correct),
          explanation: `• Xét dấu tử thức của đạo hàm $y' > 0$.\n• Hàm số đồng biến trên các khoảng: $${analysis.increasingIntervals.join('$, $')}$.\n• Do đó khoảng $${correct}$ là khoảng đồng biến của hàm số.`,
        };
      } else {
        const correct = analysis.decreasingIntervals[0];
        const fake1 = `(-\\infty; +\\infty)`;
        const fake2 = `(${analysis.excludedPointExact}; +\\infty)`;
        const fake3 = `(0; +\\infty)`;
        const options = shuffle([correct, fake1, fake2, fake3]);
        return {
          id: Date.now() + Math.random(),
          category: 'Khoảng nghịch biến',
          question: `Khoảng nào dưới đây là một khoảng nghịch biến của hàm số $${analysis.latexFormula}$?`,
          options,
          correctIndex: options.indexOf(correct),
          explanation: `• Đạo hàm $y' < 0$ với mọi $x \\neq ${analysis.excludedPointExact}$.\n• Hàm số nghịch biến trên từng khoảng xác định: $${analysis.decreasingIntervals.join('$, $')}$.\n• Do đó khoảng $${correct}$ là một khoảng nghịch biến.`,
        };
      }
    }

    // Type 9: Điểm cực đại
    if (type === 9) {
      if (analysis.hasExtrema) {
        const maxPt = analysis.extrema.find((e) => e.type === 'max');
        if (maxPt) {
          const correct = `x = ${maxPt.xExact}`;
          const minPt = analysis.extrema.find((e) => e.type === 'min');
          const fake1 = minPt ? `x = ${minPt.xExact}` : `x = 0`;
          const fake2 = `x = ${analysis.excludedPointExact}`;
          const fake3 = `x = 0`;
          const options = shuffle([correct, fake1, fake2, fake3]);
          return {
            id: Date.now() + Math.random(),
            category: 'Điểm cực đại',
            question: `Hàm số $${analysis.latexFormula}$ đạt cực đại tại điểm nào?`,
            options,
            correctIndex: options.indexOf(correct),
            explanation: `• Dựa vào bảng biến thiên hoặc dấu đạo hàm: $y'$ đổi dấu từ dương $(+)$ sang âm $(-)$ khi $x$ đi qua điểm $x = ${maxPt.xExact}$.\n• Do đó hàm số đạt cực đại tại điểm $${correct}$.`,
          };
        }
      }
    }

    // Type 10: Giá trị cực tiểu
    if (type === 10) {
      if (analysis.hasExtrema) {
        const minPt = analysis.extrema.find((e) => e.type === 'min');
        if (minPt) {
          const correct = `y_{CT} = ${minPt.yExact}`;
          const maxPt = analysis.extrema.find((e) => e.type === 'max');
          const fake1 = maxPt ? `y_{CĐ} = ${maxPt.yExact}` : `y = 0`;
          const fake2 = `y = ${analysis.symmetryCenter.exactY}`;
          const fake3 = `y = 0`;
          const options = shuffle([correct, fake1, fake2, fake3]);
          return {
            id: Date.now() + Math.random(),
            category: 'Giá trị cực tiểu',
            question: `Giá trị cực tiểu của hàm số $${analysis.latexFormula}$ bằng bao nhiêu?`,
            options,
            correctIndex: options.indexOf(correct),
            explanation: `• Hàm số đạt cực tiểu tại hoành độ $x = ${minPt.xExact}$.\n• Thay vào hàm số tìm được giá trị cực tiểu tương ứng: $f(${minPt.xExact}) = ${minPt.yExact}$.\n• Vậy giá trị cực tiểu là $${correct}$.`,
          };
        }
      }
    }

    // Type 11: Điểm đối xứng P' qua tâm I
    if (type === 11) {
      const x0 = analysis.excludedPoint;
      const testXP = Math.round(x0) + 1 === x0 ? Math.round(x0) + 2 : Math.round(x0) + 1;
      const testYP = evaluateRational(testXP, coeffs);
      if (testYP !== null) {
        const pPrimeX = 2 * analysis.symmetryCenter.x - testXP;
        const pPrimeY = 2 * analysis.symmetryCenter.y - testYP;
        const correct = `P'(${formatDecimal(pPrimeX, 1)}; ${formatDecimal(pPrimeY, 1)})`;
        const fake1 = `P'(${formatDecimal(-testXP, 1)}; ${formatDecimal(-testYP, 1)})`;
        const fake2 = `P'(${formatDecimal(testXP, 1)}; ${formatDecimal(-testYP, 1)})`;
        const fake3 = `P'(${formatDecimal(pPrimeX + 1, 1)}; ${formatDecimal(pPrimeY, 1)})`;
        const options = shuffle([correct, fake1, fake2, fake3]);
        return {
          id: Date.now() + Math.random(),
          category: 'Cặp đối xứng P & P qua tâm I',
          question: `Cho điểm $P(${testXP}; ${formatDecimal(testYP, 1)})$ thuộc đồ thị hàm số $${analysis.latexFormula}$. Tọa độ điểm đối xứng $P'$ của $P$ qua tâm đối xứng $I(${analysis.symmetryCenter.exactX}; ${analysis.symmetryCenter.exactY})$ là:`,
          options,
          correctIndex: options.indexOf(correct),
          explanation: `• Vì $I$ là tâm đối xứng của đồ thị, $I$ luôn là trung điểm của đoạn nối $PP'$.\n• Tọa độ điểm đối xứng $P'$ thỏa mãn công thức tọa độ trung điểm:\n$x_{P'} = 2x_I - x_P = 2(${analysis.symmetryCenter.exactX}) - (${testXP}) = ${formatDecimal(pPrimeX, 1)}$\n$y_{P'} = 2y_I - y_P = 2(${analysis.symmetryCenter.exactY}) - (${formatDecimal(testYP, 1)}) = ${formatDecimal(pPrimeY, 1)}$\n• Do đó tọa độ $P'$ là $${correct}$.`,
        };
      }
    }

    // Type 12: Hệ số góc tiệm cận xiên
    if (type === 12) {
      const correct = `m = ${analysis.asymptotes.oblique.exactM}`;
      const fake1 = `m = ${coeffs.a}`;
      const fake2 = `m = ${coeffs.p}`;
      const fake3 = `m = -${analysis.asymptotes.oblique.exactM}`;
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Hệ số góc tiệm cận xiên',
        question: `Hệ số góc $m$ của đường tiệm cận xiên của đồ thị hàm số $${analysis.latexFormula}$ là:`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Hệ số góc của tiệm cận xiên $y = mx + n$ được tính bằng giới hạn:\n$m = \\lim_{x \\to \\pm\\infty} \\frac{y}{x} = \\frac{a}{p} = \\frac{${coeffs.a}}{${coeffs.p}} = ${analysis.asymptotes.oblique.exactM}$.\n• Vậy $${correct}$.`,
      };
    }

    // Type 13: So sánh yCĐ và yCT (Nghịch lý cực trị)
    if (type === 13) {
      if (analysis.hasExtrema) {
        const maxPt = analysis.extrema.find((e) => e.type === 'max');
        const minPt = analysis.extrema.find((e) => e.type === 'min');
        if (maxPt && minPt) {
          const isLess = maxPt.y < minPt.y;
          const correct = isLess ? 'y_{CĐ} < y_{CT}' : 'y_{CĐ} > y_{CT}';
          const fake1 = isLess ? 'y_{CĐ} > y_{CT}' : 'y_{CĐ} < y_{CT}';
          const fake2 = 'y_{CĐ} = y_{CT}';
          const fake3 = 'y_{CĐ} = -y_{CT}';
          const options = shuffle([correct, fake1, fake2, fake3]);
          return {
            id: Date.now() + Math.random(),
            category: 'So sánh giá trị cực trị',
            question: `So sánh giá trị cực đại $y_{CĐ}$ và giá trị cực tiểu $y_{CT}$ của hàm số $${analysis.latexFormula}$?`,
            options,
            correctIndex: options.indexOf(correct),
            explanation: `• Giá trị cực đại: $y_{CĐ} = ${maxPt.yExact} \\approx ${formatDecimal(maxPt.y, 2)}$.\n• Giá trị cực tiểu: $y_{CT} = ${minPt.yExact} \\approx ${formatDecimal(minPt.y, 2)}$.\n• Do đó ta có: $${correct}$.\n${isLess ? '• Lưu ý: Đây là hiện tượng đặc biệt của hàm phân thức hữu tỉ có 2 nhánh phân cách bởi tiệm cận đứng!' : ''}`,
          };
        }
      }
    }

    // Type 14 (Fallback): Giao điểm với Ox
    if (analysis.intercepts.ox.length > 0) {
      const pt = analysis.intercepts.ox[0];
      const correct = `(${formatDecimal(pt.x, 2)}; 0)`;
      const fake1 = `(0; ${formatDecimal(pt.x, 2)})`;
      const fake2 = `(0; 0)`;
      const fake3 = `(${formatDecimal(-pt.x, 2)}; 0)`;
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Giao điểm trục Ox',
        question: `Tọa độ một giao điểm của đồ thị hàm số $${analysis.latexFormula}$ với trục hoành Ox là:`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Giao điểm với trục hoành $Ox$ ứng với tung độ $y = 0$.\n• Giải phương trình tử số: $ax^2 + bx + c = 0$.\n• Ta tìm được giao điểm với $Ox$ là $${correct}$.`,
      };
    } else {
      const correct = '0 giao điểm';
      const fake1 = '1 giao điểm';
      const fake2 = '2 giao điểm';
      const fake3 = 'Vô số giao điểm';
      const options = shuffle([correct, fake1, fake2, fake3]);
      return {
        id: Date.now() + Math.random(),
        category: 'Giao điểm trục Ox',
        question: `Số giao điểm của đồ thị hàm số $${analysis.latexFormula}$ với trục hoành Ox là:`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `• Phương trình hoành độ giao điểm với $Ox$: $ax^2 + bx + c = 0$ vô nghiệm vì $\\Delta < 0$.\n• Do đó đồ thị hàm số không bao giờ cắt trục hoành $Ox$ ($0$ giao điểm).`,
      };
    }
  };

  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, []);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setQuestionsAnswered((prev) => prev + 1);

    if (idx === currentQuestion?.correctIndex) {
      setCorrectCount((prev) => prev + 1);
      onIncrementStreak();
      onAddXp(20);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      onResetStreak();
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQuestion(generateQuestion());
  };

  if (!currentQuestion) return null;

  const accuracy = questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 100;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4 transition-colors">
      {/* Quiz Top bar: Streak & Accuracy */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/30 dark:border-cyan-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              LUYỆN TẬP TRẮC NGHIỆM TƯƠNG TÁC
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Dạng bài: <span className="text-blue-600 dark:text-cyan-400 font-semibold">{currentQuestion.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Chuỗi: {streak}</span>
          </div>

          <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
            Đúng: {correctCount}/{questionsAnswered} ({accuracy}%)
          </div>

          <button
            onClick={handleNext}
            title="Đổi câu hỏi khác"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
          <MathText text={currentQuestion.question} />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {currentQuestion.options.map((opt, idx) => {
            const isChosen = selectedOption === idx;
            const isRight = idx === currentQuestion.correctIndex;
            let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 hover:border-blue-400 dark:hover:border-slate-700 hover:bg-blue-50/40 dark:hover:bg-slate-800/80';

            if (isAnswered) {
              if (isRight) {
                btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500';
              } else if (isChosen && !isRight) {
                btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 ring-1 ring-rose-500';
              } else {
                btnStyle = 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-serif transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-sans font-bold text-xs w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="break-words">
                    <MathText text={formatQuizOption(opt)} />
                  </div>
                </div>

                {isAnswered && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 ml-2" />}
                {isAnswered && isChosen && !isRight && <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation Box (LỜI GIẢI CHI TIẾT) */}
      {isAnswered && (
        <div className="p-4 sm:p-5 bg-blue-50/40 dark:bg-slate-950 rounded-xl border border-blue-200 dark:border-cyan-500/30 space-y-2.5 animate-fadeIn text-xs leading-relaxed text-slate-800 dark:text-slate-200">
          <div className="font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-2 uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>LỜI GIẢI CHI TIẾT:</span>
          </div>
          <div className="text-sm bg-white dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
            <MathText text={currentQuestion.explanation} />
          </div>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Câu Tiếp Theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
