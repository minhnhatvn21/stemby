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

  // Hiệu ứng "ăn mừng" đơn giản bằng emoji bay.
  const celebrate = () => {
    const confetti = document.createElement('div');
    confetti.className = 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center text-4xl';
    confetti.innerText = '🎉 🎈 ✨';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1200);
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
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6 rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-black text-energy.ocean md:text-4xl">🌍 Arena Năng Lượng Xanh</h1>
        <p className="mt-2 text-lg">Chào mừng chiến binh STEM! Hãy học, chơi và cứu Trái Đất xanh hơn mỗi ngày.</p>
      </header>

      {!userId ? (
        <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold">1) Đăng nhập hồ sơ</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              className="rounded-xl border p-3 md:flex-1"
              placeholder="Nhập Tên Chiến Binh"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
            <select
              className="rounded-xl border p-3"
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
            >
              {avatars.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button onClick={registerPlayer} className="rounded-xl bg-energy.leaf px-5 py-3 font-bold text-white">
              Vào Arena
            </button>
          </div>
        </section>
      ) : (
        <section className="mb-8 grid gap-4 rounded-3xl bg-white p-6 shadow-lg md:grid-cols-3">
          <div className="rounded-2xl bg-sky-100 p-4">
            <p className="text-sm">Chiến binh</p>
            <p className="text-2xl font-bold">{avatar} {nickname}</p>
          </div>
          <div className="rounded-2xl bg-lime-100 p-4">
            <p className="text-sm">Điểm năng lượng</p>
            <p className="text-2xl font-black">⚡ {energy}</p>
          </div>
          <div className="rounded-2xl bg-yellow-100 p-4">
            <p className="text-sm">Mục tiêu hôm nay</p>
            <p className="font-bold">Lên Top 5 bảo vệ môi trường!</p>
          </div>
        </section>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold">📘 Thẻ 1: Trạm Luyện Tập</h3>
          <p className="mt-3 text-lg">{currentKnowledge.icon} {currentKnowledge.text}</p>
          <button onClick={onReadDone} className="mt-4 w-full rounded-xl bg-energy.ocean p-3 font-bold text-white">
            Đã hiểu (+10 điểm)
          </button>
        </article>

        <article className="rounded-3xl bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold">🧠 Thẻ 2: Đấu Trường Sinh Tồn</h3>
          <p className="mt-3">{challenge.question}</p>
          <div className="mt-3 space-y-2">
            {challenge.answer.map((answer) => (
              <button
                key={answer}
                onClick={() => onChallengeAnswer(answer)}
                className="w-full rounded-xl border p-2 text-left hover:shadow-glow"
              >
                {answer}
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold">🌳 Thẻ 3: Xưởng Sáng Chế</h3>
          <input
            className="mt-2 w-full rounded-xl border p-2"
            placeholder="Gốc rễ (Vấn đề)"
            value={gocRe}
            onChange={(event) => setGocRe(event.target.value)}
          />
          <input
            className="mt-2 w-full rounded-xl border p-2"
            placeholder="Thân cây (Nguyên nhân)"
            value={thanCay}
            onChange={(event) => setThanCay(event.target.value)}
          />
          <input
            className="mt-2 w-full rounded-xl border p-2"
            placeholder="Tán cây (Giải pháp)"
            value={tanCay}
            onChange={(event) => setTanCay(event.target.value)}
          />
          <button onClick={onSubmitIdea} className="mt-3 w-full rounded-xl bg-energy.sun p-3 font-bold">
            Gửi ý tưởng (+50 điểm)
          </button>
        </article>

        <article className="rounded-3xl bg-white p-5 shadow-lg">
          <h3 className="text-xl font-bold">🏆 Thẻ 4: Bảng Tương Tác</h3>
          <ol className="mt-3 space-y-2">
            {leaderboard.slice(0, 5).map((user, index) => (
              <li key={user.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2">
                <span>{index + 1}. {user.avatar} {user.nickname}</span>
                <strong>⚡ {user.diem_nang_luong}</strong>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}
