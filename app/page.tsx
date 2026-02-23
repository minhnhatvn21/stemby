'use client';

import { useEffect, useMemo, useState } from 'react';
import { addEnergyPoint, createUserProfile, submitIdea, subscribeLeaderboard, type UserProfile } from '@/lib/game';

type KnowledgeCard = { id: number; text: string; icon: string };
type ChallengeCard = { id: number; question: string; answer: string[]; correct: string };

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

  const currentKnowledge = useMemo(() => knowledgeCards[knowledgeIndex], [knowledgeIndex]);
  const challenge = challengeCards[knowledgeIndex % challengeCards.length];

  useEffect(() => {
    const savedId = localStorage.getItem('arena_user_id');
    const savedName = localStorage.getItem('arena_nickname');
    const savedAvatar = localStorage.getItem('arena_avatar');
    const savedEnergy = Number(localStorage.getItem('arena_energy') ?? '0');

    if (savedId && savedName && savedAvatar) {
      setUserId(savedId);
      setNickname(savedName);
      setAvatar(savedAvatar);
      setEnergy(savedEnergy);
    }
  }, []);

  useEffect(() => {
    const unsub = subscribeLeaderboard(setLeaderboard);
    return () => unsub();
  }, []);

  // Hiệu ứng chúc mừng kiểu năng lượng bùng nổ.
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

  const onReadDone = async () => {
    if (!userId) return;
    await addEnergyPoint(userId, 10);
    const next = energy + 10;
    setEnergy(next);
    localStorage.setItem('arena_energy', String(next));
    setKnowledgeIndex((prev) => (prev + 1) % knowledgeCards.length);
    celebrate();
  };

  const onChallengeAnswer = async (answer: string) => {
    if (!userId) return;
    if (energy < 30) {
      alert('Bạn cần ít nhất 30 điểm để vào Đấu Trường Sinh Tồn!');
      return;
    }
    if (answer === challenge.correct) {
      await addEnergyPoint(userId, 20);
      const next = energy + 20;
      setEnergy(next);
      localStorage.setItem('arena_energy', String(next));
      celebrate();
    } else {
      alert('Chưa đúng rồi, thử lại nhé!');
    }
  };

  const onSubmitIdea = async () => {
    if (!userId || !gocRe || !thanCay || !tanCay) return;

    await submitIdea({ userId, userName: nickname, gocRe, thanCay, tanCay });
    await addEnergyPoint(userId, 50);
    const next = energy + 50;
    setEnergy(next);
    localStorage.setItem('arena_energy', String(next));
    setGocRe('');
    setThanCay('');
    setTanCay('');
    celebrate();
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
            <button className="energy-button px-3 py-2">Thử thách</button>
            <button className="energy-button px-3 py-2">Bảng xếp hạng</button>
          </nav>
        </div>
      </header>

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
            <p className="text-xs uppercase text-orange-200">Mục tiêu hôm nay</p>
            <p className="mt-1 font-black text-yellow-200">Bứt phá vào Top 5 và giữ Trái Đất xanh!</p>
          </div>
        </section>
      )}

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
