import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini API client on server-side as mandated by gemini-api skill
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Math Tutor Endpoint
app.post('/api/ai-tutor', async (req, res) => {
  try {
    const { message, functionData, actionType, history } = req.body;

    const systemInstruction = `Bạn là "Gia Sư Toán 12 Rational Lab" - một trợ lý sư phạm toán học THPT Việt Nam xuất sắc, tận tâm và thông minh.
Chủ đề chuyên sâu của bạn: Khảo sát hàm số phân thức bậc hai trên bậc nhất: y = (ax^2 + bx + c) / (px + q).
Phong cách của bạn:
- Thân thiện, tôn trọng, giàu tính sư phạm, khơi gợi tư duy thay vì chỉ đưa ngay đáp án cuối cùng.
- Khi học sinh hỏi "Tại sao...", hãy giải thích bản chất hình học và đại số một cách trực quan, dễ hiểu nhất cho học sinh lớp 12.
- Khi cần công thức, hãy dùng định dạng LaTeX giữa cặp dấu $ hoặc $$.
- Luôn bám sát ngữ cảnh hàm số hiện tại mà người học đang khảo sát:
  a = ${functionData?.a}, b = ${functionData?.b}, c = ${functionData?.c}, p = ${functionData?.p}, q = ${functionData?.q}.
  Công thức: y = (${functionData?.a}x^2 + ${functionData?.b}x + ${functionData?.c}) / (${functionData?.p}x + ${functionData?.q}).
- Tránh trả lời quá dài dòng khô khan; hãy chia thành các ý mạch lạc, dùng gạch đầu dòng rõ ràng.`;

    if (!aiClient) {
      // Intelligent rule-based educational tutor response when API key is not yet set
      return res.json({
        text: generateFallbackTutorResponse(actionType, message, functionData),
      });
    }

    const prompt = actionType 
      ? `[Yêu cầu nhanh: ${actionType}] Học sinh nhắn: "${message || actionType}". Hãy giải thích chi tiết cho hàm số y = (${functionData.a}x^2 + ${functionData.b}x + ${functionData.c})/(${functionData.p}x + ${functionData.q}).`
      : `Học sinh hỏi: "${message}". Dữ liệu hàm số hiện tại: y = (${functionData.a}x^2 + ${functionData.b}x + ${functionData.c})/(${functionData.p}x + ${functionData.q}).`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    // Graceful fallback to pedagogical rule response
    res.json({
      text: generateFallbackTutorResponse(req.body.actionType, req.body.message, req.body.functionData),
      warning: 'Đang dùng phản hồi sư phạm nội bộ (kết nối AI có trục trặc nhỏ).',
    });
  }
});

// Fallback tutor responses with rich pedagogical value
function generateFallbackTutorResponse(actionType: string | undefined, message: string, fn: any): string {
  const { a, b, c, p, q } = fn || { a: 1, b: 2, c: 3, p: 1, q: -1 };
  const x0 = (-q / p).toFixed(2);
  const m = (a / p).toFixed(2);
  const n = ((b * p - a * q) / (p * p)).toFixed(2);
  const R = ((a * q * q - b * p * q + c * p * p) / (p * p)).toFixed(2);
  const delta = (4 * a * (a * q * q - b * p * q + c * p * p)).toFixed(2);

  if (actionType === 'explain_simpler' || message?.includes('dễ hiểu')) {
    return `### 💡 Giải thích trực quan về hàm số $y = \\frac{${a}x^2 + ${b}x + ${c}}{${p}x + ${q}}$:
1. **Hình dung tổng thể**: Khi chia tử cho mẫu, ta được $y = ${m}x + ${n} + \\frac{${R}}{${p}x + ${q}}$.
2. **Khi $x$ rất lớn ($x \\to \\pm \\infty$)**: Phần dư $\\frac{${R}}{${p}x + ${q}}$ tiến dần về $0$. Do đó, đồ thị ngày càng áp sát đường thẳng $y = ${m}x + ${n}$. Đó chính là **tiệm cận xiên**!
3. **Khi $x$ tiến sát $x_0 = ${x0}$**: Mẫu số dần về $0$, phân thức bùng nổ lên $+\\infty$ hoặc $-\\infty$. Đó chính là **tiệm cận đứng** $x = ${x0}$!
4. Hai đường tiệm cận này đóng vai trò như "khung xương" điều khiển toàn bộ hình dạng đồ thị.`;
  }

  if (actionType === 'why_asymptote' || message?.includes('tiệm cận')) {
    return `### 📐 Tại sao đồ thị có tiệm cận?
- **Tiệm cận đứng ($x = -\\frac{q}{p} = ${x0}$)**:
  Tại $x = ${x0}$, mẫu số bằng $0$ nhưng tử số bằng $R = ${R} \\neq 0$. Do đó $\\lim_{x \\to ${x0}} y = \\infty$. Đồ thị kéo dài vô tận dọc theo đường thẳng $x = ${x0}$.
- **Tiệm cận xiên ($y = mx + n = ${m}x + ${n}$)**:
  Chia đa thức: $\\frac{ax^2+bx+c}{px+q} = (${m}x + ${n}) + \\frac{${R}}{px+q}$.
  Vì $\\lim_{x \\to \\pm\\infty} [f(x) - (${m}x + ${n})] = \\lim_{x \\to \\pm\\infty} \\frac{${R}}{px+q} = 0$, nên đường thẳng $y = ${m}x + ${n}$ là tiệm cận xiên!`;
  }

  if (actionType === 'why_extrema' || message?.includes('cực trị')) {
    const hasExtrema = Number(delta) > 0;
    return `### ⛰️ Bản chất cực trị của hàm số:
Đạo hàm $y' = \\frac{A x^2 + B x + C}{(px+q)^2}$ có biệt thức tử số $\\Delta = ${delta}$.
${hasExtrema 
  ? `- Vì $\\Delta > 0$, phương trình $y' = 0$ có **2 nghiệm phân biệt**. Qua mỗi nghiệm này, $y'$ đổi dấu, làm hàm số chuyển từ đồng biến sang nghịch biến (hoặc ngược lại).
- Do đó đồ thị có **2 điểm cực trị** (1 cực đại và 1 cực tiểu).
- Điểm đặc biệt: Trung điểm của đoạn nối 2 cực trị này chính là **Tâm đối xứng $I$** của đồ thị!`
  : `- Vì $\\Delta \\le 0$, $y'$ không đổi dấu trên từng khoảng xác định. Do đó hàm số **không có cực trị**, đồ thị đơn điệu trên mỗi nhánh!`}`;
  }

  if (actionType === 'explain_symmetry' || message?.includes('đối xứng')) {
    return `### 🎯 Bí mật về Tâm Đối Xứng $I$:
Tâm đối xứng của đồ thị chính là **giao điểm của hai đường tiệm cận**:
- Hoành độ: $x_I = -\\frac{q}{p} = ${x0}$ (từ tiệm cận đứng)
- Tung độ: $y_I = m \\cdot x_I + n = \\frac{bp - 2aq}{p^2}$ (thay $x_I$ vào tiệm cận xiên)

**Tính chất hình học tuyệt đẹp:**
Nếu lấy điểm $P(x, y)$ bất kỳ trên đồ thị, thì điểm $P'(2x_I - x, 2y_I - y)$ cũng nằm trên đồ thị, và $I$ là trung điểm của đoạn $PP'$. Bạn có thể sang tab **"Khám phá tâm đối xứng"** để tự tay kéo điểm $P$ và quan sát!`;
  }

  if (actionType === 'similar_problem') {
    return `### 📝 Bài tập tự luyện tương tự:
Khảo sát hàm số: $g(x) = \\frac{x^2 - x + 2}{x + 1}$
1. Tìm tiệm cận đứng và tiệm cận xiên của $g(x)$.
2. Xác định tọa độ tâm đối xứng $I$.
3. Tính đạo hàm $g'(x)$ và tìm tọa độ các điểm cực trị (nếu có).
4. Viết phương trình đường thẳng đi qua hai điểm cực trị.

*Gợi ý*: Áp dụng công thức đường thẳng qua 2 cực trị: $y = \\frac{u'(x)}{v'(x)} = \\frac{2x - 1}{1} = 2x - 1$. Hãy thử nhập các hệ số $a=1, b=-1, c=2, p=1, q=1$ vào bảng thiết lập để kiểm chứng nhé!`;
  }

  return `Chào bạn! Tôi là Gia Sư Toán Rational Lab.
Đối với hàm số $y = \\frac{${a}x^2 + ${b}x + ${c}}{${p}x + ${q}}$ bạn đang chọn:
- Tập xác định: $D = \\mathbb{R} \\setminus \\{ ${x0} \\}$
- Tiệm cận đứng: $x = ${x0}$
- Tiệm cận xiên: $y = ${m}x + ${n}$
- Tâm đối xứng: $I(${x0}, ${((b * p - 2 * a * q) / (p * p)).toFixed(2)})$

Bạn muốn tìm hiểu sâu hơn về bước nào? Hãy bấm các nút gợi ý nhanh bên dưới nhé!`;
}

// Development and Production server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
