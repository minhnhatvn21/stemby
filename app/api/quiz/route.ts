import { NextResponse } from 'next/server';

type Difficulty = 'de' | 'trung_binh' | 'kho' | 'cuc_kho';

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const difficultyGuide: Record<Difficulty, string> = {
  de: 'Mức dễ, câu ngắn gọn cho học sinh tiểu học.',
  trung_binh: 'Mức trung bình, cần suy luận cơ bản.',
  kho: 'Mức khó, cần tư duy ứng dụng và cân nhắc hậu quả.',
  cuc_kho: 'Mức cực khó, nâng cao nhưng vẫn phù hợp lứa tuổi tiểu học.'
};

function fallbackQuiz(topic: string, level: Difficulty, count: number): QuizQuestion[] {
  const safeTopic = topic || 'năng lượng xanh';
  const samples: QuizQuestion[] = [
    {
      question: `Doraemon nhắc Nobita làm gì để tiết kiệm điện khi rời phòng trong chủ đề "${safeTopic}"?`,
      options: ['Bật thêm quạt', 'Tắt đèn và quạt', 'Mở tủ lạnh', 'Cắm sạc qua đêm'],
      correctIndex: 1,
      explanation: 'Tắt thiết bị khi không dùng giúp tiết kiệm điện trực tiếp.'
    },
    {
      question: 'Nếu Suneo dùng nhiều túi nilon, cách nào tốt hơn?',
      options: ['Dùng thêm túi', 'Mang túi vải/túi dùng lại', 'Vứt bừa bãi', 'Đốt túi nhựa'],
      correctIndex: 1,
      explanation: 'Túi tái sử dụng giúp giảm rác nhựa dùng một lần.'
    },
    {
      question: 'Shizuka nên làm gì để tiết kiệm nước khi đánh răng?',
      options: ['Mở vòi liên tục', 'Đóng vòi khi chải răng', 'Đổ nước ra sàn', 'Dùng 2 vòi cùng lúc'],
      correctIndex: 1,
      explanation: 'Đóng vòi đúng lúc giúp tránh lãng phí nước.'
    },
    {
      question: `Trong lớp học, việc nào đúng theo tinh thần "${safeTopic}"?`,
      options: ['Để điều hòa thật lạnh khi không có ai', 'Tắt thiết bị khi ra về', 'Mở tất cả đèn ban ngày', 'In thật nhiều giấy nháp'],
      correctIndex: 1,
      explanation: 'Thói quen tắt thiết bị khi không dùng là hành vi xanh cốt lõi.'
    },
    {
      question: 'Nobita muốn làm “anh hùng môi trường”, bạn nên khuyên gì?',
      options: ['Không cần phân loại rác', 'Phân loại rác trước khi bỏ', 'Vứt chung mọi thứ', 'Đốt rác trong sân'],
      correctIndex: 1,
      explanation: 'Phân loại rác giúp tái chế dễ và giảm ô nhiễm.'
    },
    {
      question: 'Giấy đã dùng 1 mặt thì nên làm gì?',
      options: ['Bỏ ngay', 'Dùng mặt còn lại để ghi chú', 'Ngâm nước', 'Xé nhỏ rồi vứt'],
      correctIndex: 1,
      explanation: 'Dùng lại giấy giúp tiết kiệm tài nguyên.'
    },
    {
      question: 'Khi đi học gần nhà, lựa chọn nào xanh hơn?',
      options: ['Đi bộ/xe đạp', 'Nổ xe chờ lâu', 'Đi vòng xa cho vui', 'Bật máy xe liên tục'],
      correctIndex: 0,
      explanation: 'Đi bộ hoặc xe đạp giảm phát thải khí nhà kính.'
    },
    {
      question: 'Bạn thấy bạn quên tắt điện trong lớp, bạn sẽ?',
      options: ['Mặc kệ', 'Nhắc bạn tắt điện nhẹ nhàng', 'Bật thêm đèn', 'Đóng cửa bỏ đi'],
      correctIndex: 1,
      explanation: 'Nhắc nhau cùng làm đúng tạo thói quen tốt cho tập thể.'
    },
    {
      question: 'Hoạt động nào giúp trường học xanh hơn?',
      options: ['Trồng cây trong sân trường', 'Xả rác sau giờ chơi', 'Đốt lá cây', 'Dùng nhiều đồ nhựa'],
      correctIndex: 0,
      explanation: 'Trồng cây giúp làm mát và cải thiện chất lượng không khí.'
    },
    {
      question: 'Pin đã hết nên xử lý thế nào?',
      options: ['Vứt xuống cống', 'Bỏ vào điểm thu gom pin', 'Đập pin ra', 'Ném vào lửa'],
      correctIndex: 1,
      explanation: 'Pin cần thu gom đúng nơi để tránh ô nhiễm độc hại.'
    }
  ];

  return samples.slice(0, Math.min(Math.max(count, 1), 12)).map((item) => {
    if (level === 'cuc_kho') return { ...item, question: `${item.question} (Cực khó)` };
    if (level === 'kho') return { ...item, question: `${item.question} (Nâng cao)` };
    if (level === 'trung_binh') return { ...item, question: `${item.question} (Vận dụng)` };
    return item;
  });
}

function extractJson(content: string) {
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');
  if (jsonStart >= 0 && jsonEnd > jsonStart) return trimmed.slice(jsonStart, jsonEnd + 1);
  return trimmed;
}

async function generateWithOpenAI(topic: string, level: Difficulty, count: number): Promise<QuizQuestion[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Tạo ${count} câu hỏi trắc nghiệm tiếng Việt về chủ đề "${topic}". ${difficultyGuide[level]}
Bắt buộc có ít nhất 2 câu liên quan nhân vật truyện tranh trẻ em yêu thích như Doraemon, Nobita, Shizuka.
Trả về JSON thuần theo cấu trúc:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}
Không markdown, không text thừa.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) return null;

  const result = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = result.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(extractJson(content)) as { questions?: QuizQuestion[] };
  if (!parsed.questions || !Array.isArray(parsed.questions)) return null;

  return parsed.questions
    .filter((q) => q.question && Array.isArray(q.options) && q.options.length === 4)
    .slice(0, count)
    .map((q) => ({ ...q, correctIndex: Math.max(0, Math.min(3, q.correctIndex ?? 0)) }));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { topic?: string; level?: Difficulty; count?: number };

    const topic = body.topic?.trim() || 'năng lượng bền vững';
    const level: Difficulty = body.level && ['de', 'trung_binh', 'kho', 'cuc_kho'].includes(body.level) ? body.level : 'de';
    const count = Math.min(Math.max(body.count ?? 8, 1), 12);

    let questions: QuizQuestion[] | null = null;
    try {
      questions = await generateWithOpenAI(topic, level, count);
    } catch {
      questions = null;
    }

    if (!questions || questions.length === 0) {
      questions = fallbackQuiz(topic, level, count);
    }

    return NextResponse.json({ questions, source: process.env.OPENAI_API_KEY ? 'openai_or_fallback' : 'fallback' });
  } catch {
    return NextResponse.json({ error: 'Không thể tạo câu hỏi AI lúc này.' }, { status: 500 });
  }
}
