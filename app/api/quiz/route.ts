import { NextResponse } from 'next/server';

type Difficulty = 'de' | 'trung_binh' | 'kho';

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const difficultyGuide: Record<Difficulty, string> = {
  de: 'Mức dễ, câu ngắn gọn cho học sinh tiểu học.',
  trung_binh: 'Mức trung bình, cần suy luận cơ bản.',
  kho: 'Mức khó, yêu cầu hiểu sâu hành vi xanh.'
};

function fallbackQuiz(topic: string, level: Difficulty, count: number): QuizQuestion[] {
  const safeTopic = topic || 'bảo vệ môi trường';
  const samples = [
    {
      question: `Hành động nào giúp tiết kiệm điện tốt nhất khi học về chủ đề "${safeTopic}"?`,
      options: ['Bật hết đèn cho sáng', 'Tắt thiết bị khi không dùng', 'Mở tủ lạnh liên tục', 'Cắm sạc qua đêm'],
      correctIndex: 1,
      explanation: 'Tắt thiết bị khi không dùng là cách trực tiếp giảm tiêu thụ điện.'
    },
    {
      question: `Trong chủ đề "${safeTopic}", việc nào giảm rác nhựa hiệu quả nhất?`,
      options: ['Dùng ly nhựa một lần', 'Mang bình nước cá nhân', 'Vứt rác chung 1 chỗ', 'Dùng thêm túi nilon'],
      correctIndex: 1,
      explanation: 'Mang bình cá nhân giúp giảm rác nhựa dùng một lần.'
    },
    {
      question: 'Khi ra khỏi lớp học, bạn nên làm gì trước?',
      options: ['Để quạt chạy cả giờ', 'Kiểm tra tắt điện và quạt', 'Mở thêm cửa sổ rồi đi', 'Không cần làm gì'],
      correctIndex: 1,
      explanation: 'Thói quen kiểm tra trước khi rời phòng giúp tiết kiệm năng lượng.'
    },
    {
      question: `Một giải pháp tốt trong chủ đề "${safeTopic}" là gì?`,
      options: ['Bỏ qua việc phân loại rác', 'Tái sử dụng vật dụng còn tốt', 'Dùng giấy lãng phí', 'Đốt rác tùy ý'],
      correctIndex: 1,
      explanation: 'Tái sử dụng giúp giảm phát thải và tiết kiệm tài nguyên.'
    },
    {
      question: `Nếu bạn muốn làm "đại sứ xanh" cho chủ đề "${safeTopic}", bạn sẽ?`,
      options: ['Nhắc bạn bè thực hiện thói quen xanh', 'Chỉ làm một mình', 'Không chia sẻ kiến thức', 'Phí phạm nước'],
      correctIndex: 0,
      explanation: 'Lan tỏa hành vi xanh giúp tác động tích cực đến cộng đồng.'
    }
  ];

  return samples.slice(0, Math.min(Math.max(count, 1), 5)).map((item) => {
    if (level === 'kho') {
      return { ...item, question: `${item.question} (Nâng cao)` };
    }
    if (level === 'trung_binh') {
      return { ...item, question: `${item.question} (Vận dụng)` };
    }
    return item;
  });
}

async function generateWithOpenAI(topic: string, level: Difficulty, count: number): Promise<QuizQuestion[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Tạo ${count} câu hỏi trắc nghiệm tiếng Việt về chủ đề "${topic}". ${difficultyGuide[level]}
Trả về JSON thuần theo cấu trúc:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}
Yêu cầu: phù hợp học sinh tiểu học, dễ hiểu, nội dung tích cực, không ký tự markdown.`;

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

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = result.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as { questions?: QuizQuestion[] };
  if (!parsed.questions || !Array.isArray(parsed.questions)) return null;

  return parsed.questions;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      topic?: string;
      level?: Difficulty;
      count?: number;
    };

    const topic = body.topic?.trim() || 'năng lượng bền vững';
    const level: Difficulty = body.level && ['de', 'trung_binh', 'kho'].includes(body.level) ? body.level : 'de';
    const count = Math.min(Math.max(body.count ?? 5, 1), 5);

    let questions: QuizQuestion[] | null = null;

    try {
      questions = await generateWithOpenAI(topic, level, count);
    } catch {
      questions = null;
    }

    if (!questions) {
      questions = fallbackQuiz(topic, level, count);
    }

    return NextResponse.json({ questions, source: process.env.OPENAI_API_KEY ? 'openai_or_fallback' : 'fallback' });
  } catch {
    return NextResponse.json({ error: 'Không thể tạo câu hỏi AI lúc này.' }, { status: 500 });
  }
}
