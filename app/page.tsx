'use client';

import { useEffect, useMemo, useState } from 'react';
import { addEnergyPoint, createUserProfile, submitIdea, subscribeLeaderboard, type UserProfile } from '@/lib/game';

type KnowledgeCard = { id: number; text: string; icon: string };
type ChallengeCard = { id: number; question: string; answer: string[]; correct: string };
type Mission = { id: number; title: string; reward: number; note: string };
type AIQuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const avatars = ['🦸', '🌱', '⚡', '🌍', '💧', '☀️'];

const knowledgeCards: KnowledgeCard[] = [
  { id: 1, icon: '💡', text: 'Tắt đèn khi ra khỏi phòng giúp giảm lãng phí điện.' },
  { id: 2, icon: '🚲', text: 'Đi xe đạp vừa khỏe mạnh vừa giảm khói bụi.' },
  { id: 3, icon: '♻️', text: 'Phân loại rác giúp tái chế dễ dàng hơn.' },
  { id: 4, icon: '💧', text: 'Đóng vòi nước ngay khi không dùng để tiết kiệm nước.' }
];

const challengeCards: ChallengeCard[] = [
  {
    id: 1,
    question: 'Bạn chuẩn bị đi học, trong phòng vẫn bật quạt. Em sẽ làm gì?',
    answer: ['Để vậy cho mát', 'Tắt quạt trước khi đi', 'Mở thêm đèn'],
    correct: 'Tắt quạt trước khi đi'
  },
  {
    id: 2,
    question: 'Ở sân trường có rác nhựa, em sẽ?',
    answer: ['Nhặt và bỏ đúng thùng', 'Đá ra xa', 'Bỏ qua luôn'],
    correct: 'Nhặt và bỏ đúng thùng'
  }
];

const missions: Mission[] = [
  { id: 1, title: 'Tắt 3 thiết bị điện không cần thiết', reward: 15, note: 'Nhiệm vụ tiết kiệm điện' },
  { id: 2, title: 'Mang bình nước cá nhân đi học', reward: 15, note: 'Nhiệm vụ giảm rác nhựa' },
  { id: 3, title: 'Ghi lại 1 ý tưởng xanh mới', reward: 20, note: 'Nhiệm vụ sáng tạo STEM' }
];

const growthMilestones = [
  { min: 0, rank: 'Mầm Lửa', color: 'text-orange-200' },
  { min: 50, rank: 'Chiến Binh Xanh', color: 'text-yellow-300' },
  { min: 120, rank: 'Thủ Lĩnh Năng Lượng', color: 'text-amber-300' },
  { min: 220, rank: 'Huyền Thoại Plasma', color: 'text-cyan-300' }
];

const interactionIdeas = [
  '⚔️ PvP 1v1: Hai bạn tranh tài trả lời nhanh 5 câu hỏi AI.',
  '🤝 Co-op Team: Cả nhóm cùng mở khóa nhiệm vụ trường lớp.',
  '🔥 Boss tuần: Vượt chuỗi thử thách môi trường để nhận huy hiệu.',
  '🎁 Vòng quay xanh: Đổi điểm lấy thẻ buff nhân đôi năng lượng.',
  '🛰️ Radar nhiệm vụ: Hiển thị tiến độ lớp theo thời gian thực.'
];

export default function HomePage() {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [userId, setUserId] = useState('');
  const [energy, setEnergy] = useState(0);
  const [knowledgeIndex, setKnowledgeIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);

  const [gocRe, setGocRe] = useState('');
  const [thanCay, setThanCay] = useState('');
  const [tanCay, setTanCay] = useState('');
  const [missionStatus, setMissionStatus] = useState<Record<number, boolean>>({});

  const [quizTopic, setQuizTopic] = useState('Tiết kiệm điện trong gia đình');
  const [quizLevel, setQuizLevel] = useState<'de' | 'trung_binh' | 'kho'>('de');
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<AIQuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentKnowledge = useMemo(() => knowledgeCards[knowledgeIndex], [knowledgeIndex]);
  const challenge = challengeCards[knowledgeIndex % challengeCards.length];
  const currentQuiz = quizQuestions[quizIndex];
  const quizFinished = quizQuestions.length > 0 && quizIndex >= quizQuestions.length;

  const growth = useMemo(() => {
    const current = [...growthMilestones].reverse().find((item) => energy >= item.min) ?? growthMilestones[0];
    const next = growthMilestones.find((item) => item.min > energy);
    const progress = next ? Math.min(100, Math.round((energy / next.min) * 100)) : 100;
    return { current, next, progress };
  }, [energy]);

  useEffect(() => {
    const savedId = localStorage.getItem('arena_user_id');
    const savedName = localStorage.getItem('arena_nickname');
    const savedAvatar = localStorage.getItem('arena_avatar');
    const savedEnergy = Number(localStorage.getItem('arena_energy') ?? '0');
    const savedMissions = localStorage.getItem('arena_missions');

    if (savedId && savedName && savedAvatar) {
      setUserId(savedId);
      setNickname(savedName);
      setAvatar(savedAvatar);
      setEnergy(savedEnergy);
    }

    if (savedMissions) {
      try {
        setMissionStatus(JSON.parse(savedMissions) as Record<number, boolean>);
      } catch {
        setMissionStatus({});
      }
    }
  }, []);

  useEffect(() => {
    const unsub = subscribeLeaderboard(setLeaderboard);
    return () => unsub();
  }, []);

  const celebrate = () => {
    const confetti = document.createElement('div');
    confetti.className = 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center text-5xl';
    confetti.innerText = '🔥 ⚡ ✨';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1000);
  };

  const registerPlayer = async () => {
    if (!nickname.trim()) return;
    const id = crypto.randomUUID();
    await createUserProfile({ id, nickname, avatar });
    setUserId(id);
    setEnergy(0);
    localStorage.setItem('arena_user_id', id);
    localStorage.setItem('arena_nickname', nickname);
    localStorage.setItem('arena_avatar', avatar);
    localStorage.setItem('arena_energy', '0');
  };

  const updateEnergy = async (value: number) => {
    if (!userId) return;
    await addEnergyPoint(userId, value);
    setEnergy((prev) => {
      const next = prev + value;
      localStorage.setItem('arena_energy', String(next));
      return next;
    });
    celebrate();
  };

  const onReadDone = async () => {
    await updateEnergy(10);
    setKnowledgeIndex((prev) => (prev + 1) % knowledgeCards.length);
  };

  const onChallengeAnswer = async (answer: string) => {
    if (!userId) return;
    if (energy < 30) {
      alert('Bạn cần ít nhất 30 điểm để vào Đấu Trường Sinh Tồn!');
      return;
    }
    if (answer === challenge.correct) {
      await updateEnergy(20);
    } else {
      alert('Chưa đúng rồi, thử lại nhé!');
    }
  };

  const onSubmitIdea = async () => {
    if (!userId || !gocRe || !thanCay || !tanCay) return;
    await submitIdea({ userId, userName: nickname, gocRe, thanCay, tanCay });
    await updateEnergy(50);
    setGocRe('');
    setThanCay('');
    setTanCay('');
  };

  const onCompleteMission = async (mission: Mission) => {
    if (!userId) {
      alert('Bạn hãy đăng nhập hồ sơ trước khi nhận nhiệm vụ nhé!');
      return;
    }
    if (missionStatus[mission.id]) return;

    const nextStatus = { ...missionStatus, [mission.id]: true };
    setMissionStatus(nextStatus);
    localStorage.setItem('arena_missions', JSON.stringify(nextStatus));
    await updateEnergy(mission.reward);
  };

  const generateAIQuiz = async () => {
    setQuizLoading(true);
    setQuizError('');
    setQuizQuestions([]);
    setQuizScore(0);
    setQuizIndex(0);
    setSelectedOption(null);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quizTopic,
          level: quizLevel,
          count: 5
        })
      });

      const data = (await response.json()) as { questions?: AIQuizQuestion[]; error?: string };
      if (!response.ok || !data.questions) {
        throw new Error(data.error || 'Không tạo được câu hỏi.');
      }

      setQuizQuestions(data.questions);
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : 'Lỗi không xác định khi tạo quiz AI.');
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuizAnswer = async () => {
    if (selectedOption === null || !currentQuiz) return;

    const isCorrect = selectedOption === currentQuiz.correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      await updateEnergy(8);
    }

    setSelectedOption(null);
    setQuizIndex((prev) => prev + 1);
  };

  const finishBonus = async () => {
    if (!userId || quizQuestions.length === 0) return;
    if (quizScore >= 4) {
      await updateEnergy(20);
    }
  };

  return (
    <main className="relative mx-auto min-h-screen max-w-7xl px-4 pb-10 pt-6 md:px-8">
      <div className="fire-background" aria-hidden>
        <div className="fire-wave" />
        <div className="fire-wave second" />
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={`ember-${index}`}
            className="ember"
            style={{
              width: `${4 + ((index * 3) % 6)}px`,
              height: `${4 + ((index * 3) % 6)}px`,
              left: `${(index * 7) % 100}%`,
              bottom: `-${(index * 10) % 25}px`,
              animationDuration: `${5 + (index % 5)}s`,
              animationDelay: `${index * 0.4}s`
            }}
          />
        ))}
      </div>

      <header className="fire-shell mb-6 rounded-xl px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="molten-title text-3xl md:text-5xl">Arena Năng Lượng Xanh</h1>
          <nav className="flex gap-2 text-sm md:text-base">
            <button className="energy-button px-3 py-2">Nhiệm vụ</button>
            <button className="energy-button px-3 py-2">Mô hình tăng trưởng</button>
            <button className="energy-button px-3 py-2">Bảng xếp hạng</button>
          </nav>
        </div>
      </header>

      <section className="module-grid mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['⚔️', 'Chiến Binh Arena', 'Đấu trường sinh tử'],
          ['🛡️', 'Biệt Đội Arena', 'Hợp sức tác chiến'],
          ['⚡', 'Nhanh Như Chớp', 'Tốc độ sấm sét'],
          ['📘', 'Arena Thi Online', 'Khảo thí thi online'],
          ['👥', 'Bảng Tương Tác', 'Kết nối thời gian thực'],
          ['📤', 'Cổng Nộp Bài', 'Dành cho học sinh']
        ].map((module) => (
          <article key={module[1]} className="module-tile rounded-2xl p-7 text-center">
            <div className="module-icon mx-auto mb-4 grid h-12 w-12 place-items-center">{module[0]}</div>
            <h3 className="text-3xl font-extrabold uppercase tracking-wide text-slate-100 md:text-4xl">{module[1]}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-cyan-300">{module[2]}</p>
          </article>
        ))}
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-yellow-300">💡 Ý Tưởng Tương Tác Nâng Cao</h3>
          <p className="mt-1 text-sm text-orange-100">Các ý tưởng này bạn có thể bật/tắt thành module mới khi phát triển phiên bản tiếp theo.</p>
          <ul className="mt-4 space-y-2">
            {interactionIdeas.map((idea) => (
              <li key={idea} className="idea-chip rounded-md px-3 py-2 text-sm text-orange-100">
                {idea}
              </li>
            ))}
          </ul>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-yellow-300">🤖 AI Quiz Generator</h3>
          <p className="mt-1 text-sm text-orange-100">Nhập chủ đề, hệ thống sẽ tạo câu hỏi trắc nghiệm để học sinh tương tác trực tiếp.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <input
              value={quizTopic}
              onChange={(event) => setQuizTopic(event.target.value)}
              className="fire-input col-span-2 p-2"
              placeholder="Ví dụ: Tiết kiệm nước ở trường"
            />
            <select value={quizLevel} onChange={(event) => setQuizLevel(event.target.value as 'de' | 'trung_binh' | 'kho')} className="fire-input p-2">
              <option value="de">Dễ</option>
              <option value="trung_binh">Trung bình</option>
              <option value="kho">Khó</option>
            </select>
          </div>
          <button disabled={quizLoading} onClick={generateAIQuiz} className="energy-button mt-3 w-full p-3 disabled:opacity-60">
            {quizLoading ? 'Đang tạo bộ câu hỏi...' : 'Tạo 5 câu hỏi bằng AI'}
          </button>
          {quizError ? <p className="mt-2 text-sm text-red-300">{quizError}</p> : null}

          {currentQuiz ? (
            <div className="quiz-panel mt-4 rounded-md p-3">
              <p className="text-sm text-orange-200">Câu {quizIndex + 1}/{quizQuestions.length}</p>
              <h4 className="mt-1 text-lg font-bold text-yellow-100">{currentQuiz.question}</h4>
              <div className="mt-3 space-y-2">
                {currentQuiz.options.map((option, index) => (
                  <button
                    key={`${option}-${index}`}
                    onClick={() => setSelectedOption(index)}
                    className={`quiz-option w-full rounded-md p-2 text-left ${selectedOption === index ? 'quiz-option-active' : ''}`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
              <button onClick={submitQuizAnswer} disabled={selectedOption === null} className="energy-button mt-3 w-full p-2 disabled:opacity-60">
                Xác nhận đáp án
              </button>
            </div>
          ) : null}

          {quizFinished ? (
            <div className="quiz-panel mt-4 rounded-md p-3 text-center">
              <p className="text-sm text-orange-200">Bạn đã hoàn thành bài AI Quiz!</p>
              <p className="mt-1 text-2xl font-black text-yellow-300">Điểm đúng: {quizScore}/5</p>
              <p className="mt-1 text-xs text-orange-200">Thưởng thêm +20 điểm nếu đạt từ 4/5 câu đúng.</p>
              <button onClick={finishBonus} className="energy-button mt-3 w-full p-2">
                Nhận thưởng hoàn thành
              </button>
            </div>
          ) : null}
        </article>
      </section>

      <section className="fire-shell mb-6 rounded-xl px-5 py-7 text-center md:py-10">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-yellow-300">Boss Fight Theme</p>
        <h2 className="molten-title text-4xl md:text-6xl">Kích hoạt chế độ chiến binh</h2>
        <p className="flicker mx-auto mt-3 max-w-3xl text-base text-orange-100 md:text-lg">
          Học kiến thức xanh, vượt thử thách sinh tồn và vươn lên top 5 với nguồn năng lượng plasma rực cháy.
        </p>
        <div className="mt-5">
          <button className="energy-button px-6 py-3 text-lg">Nạp năng lượng ngay</button>
        </div>
      </section>

      {!userId ? (
        <section className="fire-card mb-6 rounded-lg p-5 md:p-6">
          <h2 className="text-2xl font-black text-yellow-300">1) Khởi tạo hồ sơ Chiến Binh</h2>
          <p className="mt-1 text-sm text-orange-100">Nhập tên và chọn avatar để tạo tài khoản trong Firestore.</p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              className="fire-input p-3 md:flex-1"
              placeholder="Nhập Tên Chiến Binh"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
            <select className="fire-input p-3" value={avatar} onChange={(event) => setAvatar(event.target.value)}>
              {avatars.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button onClick={registerPlayer} className="energy-button px-5 py-3">
              Vào đấu trường
            </button>
          </div>
        </section>
      ) : (
        <section className="fire-shell mb-6 grid gap-4 rounded-xl p-4 md:grid-cols-3">
          <div className="fire-card rounded-lg p-4">
            <p className="text-xs uppercase text-orange-200">Chiến binh</p>
            <p className="mt-1 text-2xl font-black text-yellow-300">
              {avatar} {nickname}
            </p>
          </div>
          <div className="fire-card rounded-lg p-4">
            <p className="text-xs uppercase text-orange-200">Điểm năng lượng</p>
            <p className="mt-1 text-2xl font-black text-yellow-300">⚡ {energy}</p>
          </div>
          <div className="fire-card rounded-lg p-4">
            <p className="text-xs uppercase text-orange-200">Cấp bậc hiện tại</p>
            <p className={`mt-1 text-xl font-black ${growth.current.color}`}>{growth.current.rank}</p>
          </div>
        </section>
      )}

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-yellow-300">🎯 Module Nhiệm Vụ Hằng Ngày</h3>
          <p className="mt-2 text-sm text-orange-100">Hoàn thành nhiệm vụ để mở khoá thêm điểm năng lượng mỗi ngày.</p>
          <div className="mt-4 space-y-3">
            {missions.map((mission) => (
              <button
                key={mission.id}
                onClick={() => onCompleteMission(mission)}
                className="mission-row flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left"
              >
                <div>
                  <p className="font-semibold text-yellow-100">{mission.title}</p>
                  <p className="text-xs text-orange-200">{mission.note}</p>
                </div>
                <strong className="text-sm text-yellow-300">{missionStatus[mission.id] ? 'Đã xong ✅' : `+${mission.reward}`}</strong>
              </button>
            ))}
          </div>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-yellow-300">📈 Module Mô Hình Tăng Trưởng</h3>
          <p className="mt-2 text-sm text-orange-100">Mỗi điểm năng lượng là một bước tiến trên hành trình trở thành thủ lĩnh xanh.</p>
          <div className="mt-4 rounded-md border border-orange-500/40 bg-black/40 p-3">
            <div className="mb-2 flex items-center justify-between text-xs uppercase text-orange-200">
              <span>{growth.current.rank}</span>
              <span>{growth.next ? `Tiếp theo: ${growth.next.rank} (${growth.next.min}đ)` : 'Đã đạt cấp tối đa'}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="growth-bar h-full" style={{ width: `${growth.progress}%` }} />
            </div>
          </div>
          <ul className="mt-4 grid gap-2 text-sm text-orange-100 md:grid-cols-2">
            {growthMilestones.map((item) => (
              <li key={item.rank} className="rounded border border-orange-500/20 bg-black/20 px-2 py-1">
                <span className={`font-bold ${item.color}`}>{item.rank}</span> - mốc {item.min} điểm
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-yellow-300">📘 Thẻ 1: Trạm Luyện Tập</h3>
          <p className="mt-2 text-orange-100">
            {currentKnowledge.icon} {currentKnowledge.text}
          </p>
          <button onClick={onReadDone} className="energy-button mt-4 w-full p-3">
            Đã hiểu (+10 điểm)
          </button>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-yellow-300">🧠 Thẻ 2: Đấu Trường Sinh Tồn</h3>
          <p className="mt-2 text-orange-100">{challenge.question}</p>
          <div className="mt-3 space-y-2">
            {challenge.answer.map((answer) => (
              <button key={answer} onClick={() => onChallengeAnswer(answer)} className="energy-button w-full p-2 text-left">
                {answer}
              </button>
            ))}
          </div>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-yellow-300">🌳 Thẻ 3: Xưởng Sáng Chế</h3>
          <input
            className="fire-input mt-2 w-full p-2"
            placeholder="Gốc rễ (Vấn đề)"
            value={gocRe}
            onChange={(event) => setGocRe(event.target.value)}
          />
          <input
            className="fire-input mt-2 w-full p-2"
            placeholder="Thân cây (Nguyên nhân)"
            value={thanCay}
            onChange={(event) => setThanCay(event.target.value)}
          />
          <input
            className="fire-input mt-2 w-full p-2"
            placeholder="Tán cây (Giải pháp)"
            value={tanCay}
            onChange={(event) => setTanCay(event.target.value)}
          />
          <button onClick={onSubmitIdea} className="energy-button mt-3 w-full p-3">
            Gửi ý tưởng (+50 điểm)
          </button>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-yellow-300">🏆 Thẻ 4: Bảng Tương Tác</h3>
          <ol className="mt-3 space-y-2">
            {leaderboard.slice(0, 5).map((user, index) => (
              <li key={user.id} className="fire-input flex items-center justify-between p-2">
                <span>
                  {index + 1}. {user.avatar} {user.nickname}
                </span>
                <strong>⚡ {user.diem_nang_luong}</strong>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}
