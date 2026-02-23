'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addEnergyPoint,
  contributeTeamMission,
  createUserProfile,
  ensureTeamMissions,
  submitBossAttempt,
  submitIdea,
  submitPvpScore,
  subscribeBossLeaderboard,
  subscribeLeaderboard,
  subscribePvpLeaderboard,
  subscribeTeamMissions,
  type BossAttempt,
  type PvpScore,
  type TeamMission,
  type UserProfile
} from '@/lib/game';

type KnowledgeCard = { id: number; text: string; icon: string };
type ChallengeCard = { id: number; question: string; answer: string[]; correct: string };
type Mission = { id: number; title: string; reward: number; note: string };
type AIQuizLevel = 'de' | 'trung_binh' | 'kho' | 'cuc_kho';
type AIQuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
type Notice = { id: number; title: string; message: string; type: 'success' | 'warn' | 'info' };
type DailyQuizState = { date: string; levelsUsed: Record<AIQuizLevel, boolean>; streak: number };

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

const personalMissions: Mission[] = [
  { id: 1, title: 'Tắt 3 thiết bị điện không cần thiết', reward: 15, note: 'Nhiệm vụ tiết kiệm điện' },
  { id: 2, title: 'Mang bình nước cá nhân đi học', reward: 15, note: 'Nhiệm vụ giảm rác nhựa' },
  { id: 3, title: 'Ghi lại 1 ý tưởng xanh mới', reward: 20, note: 'Nhiệm vụ sáng tạo STEM' }
];

const growthMilestones = [
  { min: 0, rank: 'Mầm Xanh', color: 'text-emerald-200' },
  { min: 60, rank: 'Chiến Binh Năng Lượng', color: 'text-lime-300' },
  { min: 140, rank: 'Thủ Lĩnh Sinh Thái', color: 'text-cyan-300' },
  { min: 260, rank: 'Huyền Thoại Năng Lượng Xanh', color: 'text-sky-300' }
];

const spinRewards = [
  { text: '+10 điểm năng lượng', value: 10 },
  { text: '+20 điểm năng lượng', value: 20 },
  { text: '+30 điểm năng lượng', value: 30 },
  { text: 'Không trúng, thử lại lần sau', value: 0 }
];

const baseRewardByLevel: Record<AIQuizLevel, number> = {
  de: 6,
  trung_binh: 8,
  kho: 10,
  cuc_kho: 14
};

const penaltyByLevel: Record<AIQuizLevel, number> = {
  de: 0,
  trung_binh: 0,
  kho: -5,
  cuc_kho: -8
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function levelLabel(level: AIQuizLevel) {
  if (level === 'de') return 'Dễ';
  if (level === 'trung_binh') return 'Trung bình';
  if (level === 'kho') return 'Khó';
  return 'Cực khó';
}

export default function HomePage() {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [userId, setUserId] = useState('');
  const [energy, setEnergy] = useState(0);
  const [knowledgeIndex, setKnowledgeIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [teamMissions, setTeamMissions] = useState<TeamMission[]>([]);
  const [bossBoard, setBossBoard] = useState<BossAttempt[]>([]);
  const [pvpBoard, setPvpBoard] = useState<PvpScore[]>([]);

  const [gocRe, setGocRe] = useState('');
  const [thanCay, setThanCay] = useState('');
  const [tanCay, setTanCay] = useState('');
  const [missionStatus, setMissionStatus] = useState<Record<number, boolean>>({});

  const [notices, setNotices] = useState<Notice[]>([]);
  const [teamMissionMessage, setTeamMissionMessage] = useState('');

  const [quizTopic, setQuizTopic] = useState('Năng lượng xanh ở trường học với Doraemon và Nobita');
  const [quizLevel, setQuizLevel] = useState<AIQuizLevel>('de');
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<AIQuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [pvpSubmitted, setPvpSubmitted] = useState(false);
  const [dailyQuizState, setDailyQuizState] = useState<DailyQuizState>({
    date: todayKey(),
    levelsUsed: { de: false, trung_binh: false, kho: false, cuc_kho: false },
    streak: 0
  });

  const [bossChecklist, setBossChecklist] = useState({ task1: false, task2: false, task3: false });
  const [spinResult, setSpinResult] = useState('Chưa quay vòng quay');

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

  const radarSummary = useMemo(() => {
    const done = teamMissions.reduce((sum, item) => sum + Math.min(item.progress, item.target), 0);
    const target = teamMissions.reduce((sum, item) => sum + item.target, 0);
    const percent = target ? Math.round((done / target) * 100) : 0;
    return { done, target, percent };
  }, [teamMissions]);

  const dailyDifficulty = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { label: 'Buổi sáng: Dễ', missionBoost: 0, quizBoost: 0 };
    if (hour < 18) return { label: 'Buổi chiều: Trung bình', missionBoost: 1, quizBoost: 1 };
    return { label: 'Buổi tối: Khó dần', missionBoost: 2, quizBoost: 2 };
  }, []);

  const pushNotice = (title: string, message: string, type: Notice['type']) => {
    const id = Date.now() + Math.floor(Math.random() * 999);
    setNotices((prev) => [{ id, title, message, type }, ...prev].slice(0, 8));
  };

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

      const rawDaily = localStorage.getItem(`arena_daily_quiz_${savedId}`);
      if (rawDaily) {
        try {
          const parsed = JSON.parse(rawDaily) as DailyQuizState;
          if (parsed.date === todayKey()) {
            setDailyQuizState(parsed);
          }
        } catch {
          // bỏ qua
        }
      }
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
    ensureTeamMissions().catch(() => undefined);

    const unsubUsers = subscribeLeaderboard(setLeaderboard);
    const unsubTeamMissions = subscribeTeamMissions(setTeamMissions);
    const unsubBoss = subscribeBossLeaderboard(setBossBoard);
    const unsubPvp = subscribePvpLeaderboard(setPvpBoard);

    return () => {
      unsubUsers();
      unsubTeamMissions();
      unsubBoss();
      unsubPvp();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`arena_daily_quiz_${userId}`, JSON.stringify(dailyQuizState));
  }, [dailyQuizState, userId]);

  const celebrate = () => {
    const confetti = document.createElement('div');
    confetti.className = 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center text-5xl';
    confetti.innerText = '🌿 ⚡ ✨';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 900);
  };

  const registerPlayer = async () => {
    if (!nickname.trim()) return;
    const id = crypto.randomUUID();
    await createUserProfile({ id, nickname, avatar });
    setUserId(id);
    setEnergy(0);
    const today = todayKey();
    const initialDaily: DailyQuizState = {
      date: today,
      levelsUsed: { de: false, trung_binh: false, kho: false, cuc_kho: false },
      streak: 0
    };
    setDailyQuizState(initialDaily);
    localStorage.setItem('arena_user_id', id);
    localStorage.setItem('arena_nickname', nickname);
    localStorage.setItem('arena_avatar', avatar);
    localStorage.setItem('arena_energy', '0');
    localStorage.setItem(`arena_daily_quiz_${id}`, JSON.stringify(initialDaily));
    pushNotice('Tạo tài khoản thành công', `Chào mừng ${nickname} đến đấu trường năng lượng xanh!`, 'success');
  };

  const logoutPlayer = () => {
    localStorage.removeItem('arena_user_id');
    localStorage.removeItem('arena_nickname');
    localStorage.removeItem('arena_avatar');
    localStorage.removeItem('arena_energy');
    setUserId('');
    setNickname('');
    setEnergy(0);
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizScore(0);
    pushNotice('Đã thoát tài khoản', 'Bạn có thể đăng ký hoặc đăng nhập tài khoản khác.', 'info');
  };

  const updateEnergy = async (value: number) => {
    if (!userId || value === 0) return;
    await addEnergyPoint(userId, value);
    setEnergy((prev) => {
      const next = prev + value;
      localStorage.setItem('arena_energy', String(next));
      return next;
    });
    celebrate();
  };

  const onReadDone = async () => {
    await updateEnergy(10 + dailyDifficulty.quizBoost);
    setKnowledgeIndex((prev) => (prev + 1) % knowledgeCards.length);
  };

  const onChallengeAnswer = async (answer: string) => {
    if (!userId) return;
    if (energy < 30) {
      pushNotice('Chưa đủ điểm', 'Bạn cần ít nhất 30 điểm để vào Đấu Trường Sinh Tồn!', 'warn');
      return;
    }
    if (answer === challenge.correct) {
      await updateEnergy(20 + dailyDifficulty.quizBoost);
      pushNotice('Trả lời đúng', 'Bạn nhận thêm điểm năng lượng!', 'success');
    } else {
      pushNotice('Sai đáp án', 'Chưa đúng rồi, thử lại nhé!', 'warn');
    }
  };

  const onSubmitIdea = async () => {
    if (!userId || !gocRe || !thanCay || !tanCay) return;
    await submitIdea({ userId, userName: nickname, gocRe, thanCay, tanCay });
    await updateEnergy(50 + dailyDifficulty.missionBoost * 2);
    setGocRe('');
    setThanCay('');
    setTanCay('');
    pushNotice('Ý tưởng đã gửi', 'Cảm ơn bạn đã đóng góp ý tưởng xanh cho lớp!', 'success');
  };

  const onCompleteMission = async (mission: Mission) => {
    if (!userId) {
      pushNotice('Cần đăng nhập', 'Bạn hãy đăng nhập hồ sơ trước khi nhận nhiệm vụ nhé!', 'warn');
      return;
    }
    if (missionStatus[mission.id]) return;

    const nextStatus = { ...missionStatus, [mission.id]: true };
    setMissionStatus(nextStatus);
    localStorage.setItem('arena_missions', JSON.stringify(nextStatus));
    await updateEnergy(mission.reward + dailyDifficulty.missionBoost * 2);
    pushNotice('Hoàn thành nhiệm vụ', `Bạn hoàn thành: ${mission.title}`, 'success');
  };

  const onContributeTeamMission = async (mission: TeamMission) => {
    if (!userId) {
      setTeamMissionMessage('⚠️ Hãy đăng nhập để tham gia nhiệm vụ lớp.');
      return;
    }

    const success = await contributeTeamMission(userId, nickname, mission);
    if (success) {
      const bonus = mission.reward + dailyDifficulty.missionBoost;
      setTeamMissionMessage(`✅ Bạn đã đóng góp cho nhiệm vụ: ${mission.title}.`);
      setEnergy((prev) => {
        const next = prev + bonus;
        localStorage.setItem('arena_energy', String(next));
        return next;
      });
      celebrate();
      pushNotice('Đóng góp thành công', `Bạn nhận +${bonus} điểm từ nhiệm vụ lớp.`, 'success');
    } else {
      setTeamMissionMessage('ℹ️ Bạn đã đóng góp nhiệm vụ này rồi, hãy hỗ trợ nhiệm vụ khác nhé!');
      pushNotice('Đã tham gia trước đó', 'Mỗi tài khoản chỉ tính 1 lượt mỗi nhiệm vụ lớp.', 'info');
    }
  };

  const generateAIQuiz = async () => {
    if (!userId) {
      pushNotice('Cần đăng nhập', 'Hãy đăng nhập trước khi tạo quiz AI.', 'warn');
      return;
    }

    const today = todayKey();
    const normalized = dailyQuizState.date === today ? dailyQuizState : {
      date: today,
      levelsUsed: { de: false, trung_binh: false, kho: false, cuc_kho: false },
      streak: 0
    };

    if (normalized.levelsUsed[quizLevel]) {
      pushNotice('Giới hạn trong ngày', `Mức ${levelLabel(quizLevel)} đã được chọn hôm nay. Hãy chọn mức khác.`, 'warn');
      return;
    }

    setDailyQuizState({
      ...normalized,
      levelsUsed: { ...normalized.levelsUsed, [quizLevel]: true }
    });

    setQuizLoading(true);
    setQuizError('');
    setQuizQuestions([]);
    setQuizScore(0);
    setQuizIndex(0);
    setSelectedOption(null);
    setPvpSubmitted(false);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: quizTopic, level: quizLevel, count: 10 })
      });

      const data = (await response.json()) as { questions?: AIQuizQuestion[]; error?: string };
      if (!response.ok || !data.questions) {
        throw new Error(data.error || 'Không tạo được câu hỏi.');
      }

      setQuizQuestions(data.questions);
      pushNotice('Tạo quiz thành công', `Bộ câu hỏi mức ${levelLabel(quizLevel)} đã sẵn sàng.`, 'success');
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : 'Lỗi không xác định khi tạo quiz AI.');
      pushNotice('Lỗi tạo quiz', 'Hiện chưa tạo được quiz AI, vui lòng thử lại sau.', 'warn');
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuizAnswer = async () => {
    if (selectedOption === null || !currentQuiz) return;

    const isCorrect = selectedOption === currentQuiz.correctIndex;
    if (isCorrect) {
      const base = baseRewardByLevel[quizLevel] + dailyDifficulty.quizBoost;
      const nextStreak = dailyQuizState.streak + 1;
      let reward = base;

      if (quizLevel === 'cuc_kho' && nextStreak >= 3) {
        reward = base * 2;
        pushNotice('Combo tuyệt vời!', 'Bạn đúng 3 câu liên tiếp ở mức cực khó: nhận điểm gấp đôi!', 'success');
      }

      await updateEnergy(reward);
      setQuizScore((prev) => prev + 1);
      setDailyQuizState((prev) => ({ ...prev, streak: nextStreak }));
    } else {
      const penalty = penaltyByLevel[quizLevel];
      if (penalty < 0) {
        await updateEnergy(penalty);
        pushNotice('Sai ở mức khó', `Bạn bị trừ ${Math.abs(penalty)} điểm vì chọn mức ${levelLabel(quizLevel)}.`, 'warn');
      }
      setDailyQuizState((prev) => ({ ...prev, streak: 0 }));
    }

    setSelectedOption(null);
    setQuizIndex((prev) => prev + 1);
  };

  const finishBonus = async () => {
    if (!userId || quizQuestions.length === 0) return;
    if (quizScore >= 6) {
      await updateEnergy(25);
      pushNotice('Thưởng hoàn thành', 'Bạn đạt ngưỡng thưởng bài quiz trong ngày!', 'success');
    } else {
      pushNotice('Hoàn thành quiz', 'Bạn đã làm xong quiz. Cố gắng thêm để nhận thưởng nhé!', 'info');
    }
  };

  const submitPvpFromQuiz = async () => {
    if (!userId || !quizFinished || pvpSubmitted) return;
    await submitPvpScore(userId, nickname, quizScore);
    setPvpSubmitted(true);
    await updateEnergy(10);
    pushNotice('Đã gửi PvP', 'Điểm của bạn đã lên bảng PvP 1v1.', 'success');
  };

  const submitBossChallenge = async () => {
    if (!userId) return;
    const score = [bossChecklist.task1, bossChecklist.task2, bossChecklist.task3].filter(Boolean).length * 35;
    await submitBossAttempt(userId, nickname, score);
    pushNotice('Boss tuần', score >= 80 ? 'Bạn đã vượt Boss tuần và nhận thưởng!' : 'Bạn đã gửi thử thách Boss tuần. Hãy cố thêm nhé!', score >= 80 ? 'success' : 'info');
    setBossChecklist({ task1: false, task2: false, task3: false });
  };

  const spinGreenWheel = async () => {
    if (!userId) return;
    const result = spinRewards[Math.floor(Math.random() * spinRewards.length)];
    setSpinResult(result.text);
    if (result.value > 0) {
      await updateEnergy(result.value);
      pushNotice('Vòng quay xanh', `Chúc mừng! ${result.text}.`, 'success');
    } else {
      pushNotice('Vòng quay xanh', 'Lần này chưa may mắn, thử lại nhé!', 'info');
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
          <div className="flex flex-wrap gap-2 text-sm md:text-base">
            <span className="status-pill px-3 py-2">🗓️ {dailyDifficulty.label}</span>
            {userId ? (
              <button className="energy-button px-3 py-2" onClick={logoutPlayer}>
                Thoát tài khoản
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <section className="notice-board mb-6 rounded-xl p-4">
        <h3 className="text-lg font-black text-emerald-200">📣 Bảng thông báo năng lượng</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {notices.length === 0 ? (
            <p className="text-sm text-emerald-100">Chưa có thông báo mới. Hãy bắt đầu một nhiệm vụ để nhận cập nhật.</p>
          ) : (
            notices.map((n) => (
              <div key={n.id} className={`notice-item notice-${n.type} rounded-md p-2`}>
                <p className="font-bold">{n.title}</p>
                <p className="text-sm">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {!userId ? (
        <section className="fire-card mb-6 rounded-lg p-5 md:p-6">
          <h2 className="text-2xl font-black text-emerald-200">🔐 Đăng ký tài khoản chiến binh</h2>
          <p className="mt-1 text-sm text-emerald-100">Mỗi học sinh dùng 1 tài khoản để lưu điểm và giới hạn nhiệm vụ theo ngày.</p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input className="fire-input p-3 md:flex-1" placeholder="Nhập Tên Chiến Binh" value={nickname} onChange={(event) => setNickname(event.target.value)} />
            <select className="fire-input p-3" value={avatar} onChange={(event) => setAvatar(event.target.value)}>
              {avatars.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button onClick={registerPlayer} className="energy-button px-5 py-3">
              Tạo tài khoản
            </button>
          </div>
        </section>
      ) : (
        <section className="fire-shell mb-6 grid gap-4 rounded-xl p-4 md:grid-cols-3">
          <div className="fire-card rounded-lg p-4">
            <p className="text-xs uppercase text-emerald-200">Chiến binh</p>
            <p className="mt-1 text-2xl font-black text-lime-200">
              {avatar} {nickname}
            </p>
          </div>
          <div className="fire-card rounded-lg p-4">
            <p className="text-xs uppercase text-emerald-200">Điểm năng lượng</p>
            <p className="mt-1 text-2xl font-black text-lime-200">⚡ {energy}</p>
          </div>
          <div className="fire-card rounded-lg p-4">
            <p className="text-xs uppercase text-emerald-200">Cấp bậc hiện tại</p>
            <p className={`mt-1 text-xl font-black ${growth.current.color}`}>{growth.current.rank}</p>
          </div>
        </section>
      )}

      <section className="mb-6 grid gap-4 xl:grid-cols-3">
        <article className="fire-card rounded-lg p-5 xl:col-span-2">
          <h3 className="text-xl font-black text-emerald-200">🤝 Nhiệm vụ lớp theo thời gian thực</h3>
          <p className="mt-1 text-sm text-emerald-100">Nhiệm vụ sẽ khó dần trong ngày theo khung giờ để tăng thử thách.</p>
          <div className="mt-4 space-y-3">
            {teamMissions.map((mission) => {
              const target = mission.target + dailyDifficulty.missionBoost * 3;
              const percent = Math.min(100, Math.round((mission.progress / target) * 100));
              return (
                <div key={mission.id} className="team-mission-card rounded-md p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-emerald-100">{mission.title}</strong>
                    <span className="text-xs text-emerald-200">
                      {mission.progress}/{target} ({percent}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded bg-slate-800">
                    <div className="growth-bar h-full" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-emerald-200">Đã tham gia: {mission.participantsCount} bạn</span>
                    <button onClick={() => onContributeTeamMission(mission)} className="energy-button px-3 py-1 text-sm">
                      Đóng góp (+{mission.reward + dailyDifficulty.missionBoost})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {teamMissionMessage ? <p className="mt-3 text-sm text-lime-200">{teamMissionMessage}</p> : null}
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">🛰️ Radar nhiệm vụ</h3>
          <div className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
            <p className="text-xs uppercase text-emerald-200">Tiến độ lớp</p>
            <p className="mt-1 text-2xl font-black text-lime-200">{radarSummary.percent}%</p>
            <p className="text-sm text-emerald-200">
              {radarSummary.done}/{radarSummary.target} lượt đóng góp
            </p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-emerald-100">
            <li>👥 Số chiến binh đang có điểm: {leaderboard.length}</li>
            <li>🔥 Top 1 hiện tại: {leaderboard[0]?.nickname ?? 'Chưa có dữ liệu'}</li>
            <li>⚡ Tổng điểm top 5: {leaderboard.slice(0, 5).reduce((sum, item) => sum + item.diem_nang_luong, 0)}</li>
          </ul>
        </article>
      </section>

      <section className="mb-6 grid gap-4 xl:grid-cols-3">
        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">🤖 PvP 1v1 AI Sprint</h3>
          {quizFinished ? (
            <button onClick={submitPvpFromQuiz} disabled={pvpSubmitted} className="energy-button mt-3 w-full p-2 disabled:opacity-60">
              {pvpSubmitted ? 'Đã gửi điểm PvP' : `Gửi điểm PvP: ${quizScore}/${quizQuestions.length} (+10 điểm)`}
            </button>
          ) : (
            <p className="mt-3 text-sm text-emerald-100">Hoàn thành AI Quiz để mở khoá gửi điểm PvP.</p>
          )}
          <ol className="mt-3 space-y-2 text-sm">
            {pvpBoard.map((item, index) => (
              <li key={item.id} className="rounded border border-cyan-500/30 bg-cyan-900/10 px-2 py-1 text-cyan-100">
                {index + 1}. {item.userName} - {item.score}
              </li>
            ))}
          </ol>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">🔥 Boss tuần</h3>
          <div className="mt-3 space-y-2 text-sm text-emerald-100">
            <label className="boss-check flex items-center gap-2 rounded-md px-2 py-2">
              <input type="checkbox" checked={bossChecklist.task1} onChange={(event) => setBossChecklist((prev) => ({ ...prev, task1: event.target.checked }))} />
              Tắt điện trước khi rời lớp
            </label>
            <label className="boss-check flex items-center gap-2 rounded-md px-2 py-2">
              <input type="checkbox" checked={bossChecklist.task2} onChange={(event) => setBossChecklist((prev) => ({ ...prev, task2: event.target.checked }))} />
              Phân loại rác đúng 3 nhóm
            </label>
            <label className="boss-check flex items-center gap-2 rounded-md px-2 py-2">
              <input type="checkbox" checked={bossChecklist.task3} onChange={(event) => setBossChecklist((prev) => ({ ...prev, task3: event.target.checked }))} />
              Chia sẻ 1 ý tưởng xanh cho lớp
            </label>
          </div>
          <button onClick={submitBossChallenge} className="energy-button mt-3 w-full p-2">
            Gửi thử thách Boss tuần
          </button>
          <ol className="mt-3 space-y-2 text-sm">
            {bossBoard.map((item, index) => (
              <li key={item.id} className="rounded border border-emerald-500/30 bg-emerald-900/10 px-2 py-1 text-emerald-100">
                {index + 1}. {item.userName} - {item.score} điểm
              </li>
            ))}
          </ol>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">🎁 Vòng quay xanh</h3>
          <button onClick={spinGreenWheel} className="energy-button mt-3 w-full p-3">
            Quay ngay
          </button>
          <p className="mt-3 rounded-md border border-lime-500/40 bg-lime-500/10 p-2 text-sm text-lime-200">Kết quả: {spinResult}</p>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">🤖 AI Quiz Generator</h3>
          <p className="mt-1 text-sm text-emerald-100">Mỗi tài khoản chỉ chọn mỗi mức độ 1 lần trong ngày. Bộ câu hỏi gồm nhiều câu hơn và có Doraemon/Nobita.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <input value={quizTopic} onChange={(event) => setQuizTopic(event.target.value)} className="fire-input col-span-2 p-2" placeholder="Ví dụ: Bảo vệ môi trường với Doraemon" />
            <select value={quizLevel} onChange={(event) => setQuizLevel(event.target.value as AIQuizLevel)} className="fire-input p-2">
              <option value="de">Dễ</option>
              <option value="trung_binh">Trung bình</option>
              <option value="kho">Khó</option>
              <option value="cuc_kho">Cực khó</option>
            </select>
          </div>
          <div className="mt-2 text-xs text-emerald-200">
            Đã dùng hôm nay: {Object.entries(dailyQuizState.levelsUsed).filter(([, used]) => used).map(([lvl]) => levelLabel(lvl as AIQuizLevel)).join(', ') || 'Chưa dùng mức nào'}
          </div>
          <button disabled={quizLoading} onClick={generateAIQuiz} className="energy-button mt-3 w-full p-3 disabled:opacity-60">
            {quizLoading ? 'Đang tạo bộ câu hỏi...' : 'Tạo 10 câu hỏi bằng AI'}
          </button>
          {quizError ? <p className="mt-2 text-sm text-red-300">{quizError}</p> : null}

          {currentQuiz ? (
            <div className="quiz-panel mt-4 rounded-md p-3">
              <p className="text-sm text-emerald-200">Câu {quizIndex + 1}/{quizQuestions.length} • Chuỗi đúng: {dailyQuizState.streak}</p>
              <h4 className="mt-1 text-lg font-bold text-lime-100">{currentQuiz.question}</h4>
              <div className="mt-3 space-y-2">
                {currentQuiz.options.map((option, index) => (
                  <button key={`${option}-${index}`} onClick={() => setSelectedOption(index)} className={`quiz-option w-full rounded-md p-2 text-left ${selectedOption === index ? 'quiz-option-active' : ''}`}>
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
              <p className="text-sm text-emerald-200">Bạn đã hoàn thành bài AI Quiz!</p>
              <p className="mt-1 text-2xl font-black text-lime-300">Điểm đúng: {quizScore}/{quizQuestions.length}</p>
              <p className="mt-1 text-xs text-emerald-200">Đạt từ 6 câu đúng để nhận thưởng hoàn thành +25 điểm.</p>
              <button onClick={finishBonus} className="energy-button mt-3 w-full p-2">
                Nhận thưởng hoàn thành
              </button>
            </div>
          ) : null}
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">📈 Tăng trưởng & nhiệm vụ cá nhân</h3>
          <div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3">
            <div className="mb-2 flex items-center justify-between text-xs uppercase text-emerald-200">
              <span>{growth.current.rank}</span>
              <span>{growth.next ? `Tiếp theo: ${growth.next.rank} (${growth.next.min}đ)` : 'Đã đạt cấp tối đa'}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="growth-bar h-full" style={{ width: `${growth.progress}%` }} />
            </div>
          </div>
          <ul className="mt-4 grid gap-2 text-sm text-emerald-100 md:grid-cols-2">
            {growthMilestones.map((item) => (
              <li key={item.rank} className="rounded border border-emerald-500/20 bg-emerald-950/20 px-2 py-1">
                <span className={`font-bold ${item.color}`}>{item.rank}</span> - mốc {item.min} điểm
              </li>
            ))}
          </ul>

          <h4 className="mt-4 text-lg font-black text-lime-200">🎯 Nhiệm vụ cá nhân</h4>
          <div className="mt-2 space-y-2">
            {personalMissions.map((mission) => (
              <button key={mission.id} onClick={() => onCompleteMission(mission)} className="mission-row flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left">
                <div>
                  <p className="font-semibold text-emerald-100">{mission.title}</p>
                  <p className="text-xs text-emerald-200">{mission.note}</p>
                </div>
                <strong className="text-sm text-lime-300">{missionStatus[mission.id] ? 'Đã xong ✅' : `+${mission.reward + dailyDifficulty.missionBoost * 2}`}</strong>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">📘 Thẻ 1: Trạm Luyện Tập</h3>
          <p className="mt-2 text-emerald-100">
            {currentKnowledge.icon} {currentKnowledge.text}
          </p>
          <button onClick={onReadDone} className="energy-button mt-4 w-full p-3">
            Đã hiểu (+{10 + dailyDifficulty.quizBoost} điểm)
          </button>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">🧠 Thẻ 2: Đấu Trường Sinh Tồn</h3>
          <p className="mt-2 text-emerald-100">{challenge.question}</p>
          <div className="mt-3 space-y-2">
            {challenge.answer.map((answer) => (
              <button key={answer} onClick={() => onChallengeAnswer(answer)} className="energy-button w-full p-2 text-left">
                {answer}
              </button>
            ))}
          </div>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">🌳 Thẻ 3: Xưởng Sáng Chế</h3>
          <input className="fire-input mt-2 w-full p-2" placeholder="Gốc rễ (Vấn đề)" value={gocRe} onChange={(event) => setGocRe(event.target.value)} />
          <input className="fire-input mt-2 w-full p-2" placeholder="Thân cây (Nguyên nhân)" value={thanCay} onChange={(event) => setThanCay(event.target.value)} />
          <input className="fire-input mt-2 w-full p-2" placeholder="Tán cây (Giải pháp)" value={tanCay} onChange={(event) => setTanCay(event.target.value)} />
          <button onClick={onSubmitIdea} className="energy-button mt-3 w-full p-3">
            Gửi ý tưởng (+{50 + dailyDifficulty.missionBoost * 2} điểm)
          </button>
        </article>

        <article className="fire-card rounded-lg p-5">
          <h3 className="text-xl font-black text-emerald-200">🏆 Thẻ 4: Bảng Tương Tác</h3>
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
