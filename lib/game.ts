import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

export type UserProfile = {
  id: string;
  nickname: string;
  avatar: string;
  diem_nang_luong: number;
};

export type IdeaPayload = {
  userId: string;
  userName: string;
  gocRe: string;
  thanCay: string;
  tanCay: string;
};

export type TeamMission = {
  id: string;
  title: string;
  target: number;
  progress: number;
  reward: number;
  participantsCount: number;
};

export type BossAttempt = {
  id: string;
  userName: string;
  score: number;
};

export type PvpScore = {
  id: string;
  userName: string;
  score: number;
  createdAt: number;
};

const defaultTeamMissions: Array<Omit<TeamMission, 'participantsCount' | 'progress'> & { id: string }> = [
  { id: 'save-electricity', title: 'Tắt thiết bị điện sau giờ học', target: 25, reward: 10 },
  { id: 'plastic-free', title: 'Mang bình nước cá nhân', target: 20, reward: 10 },
  { id: 'green-idea', title: 'Mỗi bạn nộp 1 ý tưởng xanh', target: 15, reward: 15 }
];

// Tạo hồ sơ mới cho người chơi.
export async function createUserProfile(profile: Omit<UserProfile, 'diem_nang_luong'>) {
  await setDoc(doc(db, 'users', profile.id), {
    nickname: profile.nickname,
    avatar: profile.avatar,
    diem_nang_luong: 0,
    badges: [],
    updatedAt: Date.now()
  });
}

// Cộng điểm năng lượng cho người chơi.
export async function addEnergyPoint(userId: string, value: number) {
  await updateDoc(doc(db, 'users', userId), {
    diem_nang_luong: increment(value),
    updatedAt: Date.now()
  });
}

// Lưu ý tưởng của mô hình cây vấn đề.
export async function submitIdea(payload: IdeaPayload) {
  await addDoc(collection(db, 'ideas'), {
    ...payload,
    createdAt: Date.now()
  });
}

// Lắng nghe bảng xếp hạng realtime.
export function subscribeLeaderboard(onData: (users: UserProfile[]) => void): Unsubscribe {
  const usersQuery = query(collection(db, 'users'), orderBy('diem_nang_luong', 'desc'));

  return onSnapshot(usersQuery, (snapshot) => {
    const users = snapshot.docs.map((item) => ({
      id: item.id,
      nickname: item.data().nickname ?? 'Chiến binh',
      avatar: item.data().avatar ?? '🌱',
      diem_nang_luong: item.data().diem_nang_luong ?? 0
    }));

    onData(users);
  });
}

// Khởi tạo nhiệm vụ chung cho lớp nếu chưa có dữ liệu.
export async function ensureTeamMissions() {
  const snap = await getDocs(query(collection(db, 'team_missions'), limit(1)));
  if (!snap.empty) return;

  await Promise.all(
    defaultTeamMissions.map((mission) =>
      setDoc(doc(db, 'team_missions', mission.id), {
        ...mission,
        progress: 0,
        participantsCount: 0,
        updatedAt: Date.now()
      })
    )
  );
}

// Lắng nghe danh sách nhiệm vụ chung realtime.
export function subscribeTeamMissions(onData: (missions: TeamMission[]) => void): Unsubscribe {
  const missionQuery = query(collection(db, 'team_missions'), orderBy('updatedAt', 'desc'));
  return onSnapshot(missionQuery, (snapshot) => {
    const missions = snapshot.docs.map((item) => ({
      id: item.id,
      title: item.data().title ?? 'Nhiệm vụ chung',
      target: item.data().target ?? 10,
      progress: item.data().progress ?? 0,
      reward: item.data().reward ?? 10,
      participantsCount: item.data().participantsCount ?? 0
    }));
    onData(missions);
  });
}

// Người chơi tham gia nhiệm vụ chung (mỗi người chỉ tính 1 lần / nhiệm vụ).
export async function contributeTeamMission(userId: string, userName: string, mission: TeamMission): Promise<boolean> {
  const logRef = doc(db, 'team_mission_logs', `${mission.id}_${userId}`);
  const logSnap = await getDoc(logRef);
  if (logSnap.exists()) return false;

  await setDoc(logRef, {
    missionId: mission.id,
    userId,
    userName,
    createdAt: Date.now()
  });

  await updateDoc(doc(db, 'team_missions', mission.id), {
    progress: increment(1),
    participantsCount: increment(1),
    participants: arrayUnion(userId),
    updatedAt: Date.now()
  });

  await addEnergyPoint(userId, mission.reward);
  return true;
}

// Gửi điểm thử thách boss tuần.
export async function submitBossAttempt(userId: string, userName: string, score: number) {
  await addDoc(collection(db, 'boss_attempts'), {
    userId,
    userName,
    score,
    createdAt: Date.now()
  });

  if (score >= 80) {
    await updateDoc(doc(db, 'users', userId), {
      badges: arrayUnion('🔥 Huy hiệu Boss tuần'),
      updatedAt: Date.now()
    });
    await addEnergyPoint(userId, 30);
  }
}

// Lắng nghe top boss tuần.
export function subscribeBossLeaderboard(onData: (attempts: BossAttempt[]) => void): Unsubscribe {
  const bossQuery = query(collection(db, 'boss_attempts'), orderBy('score', 'desc'), limit(5));
  return onSnapshot(bossQuery, (snapshot) => {
    const attempts = snapshot.docs.map((item) => ({
      id: item.id,
      userName: item.data().userName ?? 'Chiến binh',
      score: item.data().score ?? 0
    }));
    onData(attempts);
  });
}

// Lưu điểm đấu trường PvP nhanh (ai đạt điểm cao lên top).
export async function submitPvpScore(userId: string, userName: string, score: number) {
  await addDoc(collection(db, 'pvp_scores'), {
    userId,
    userName,
    score,
    createdAt: Date.now()
  });
}

// Lắng nghe bảng xếp hạng PvP.
export function subscribePvpLeaderboard(onData: (scores: PvpScore[]) => void): Unsubscribe {
  const pvpQuery = query(collection(db, 'pvp_scores'), orderBy('score', 'desc'), limit(5));
  return onSnapshot(pvpQuery, (snapshot) => {
    const scores = snapshot.docs.map((item) => ({
      id: item.id,
      userName: item.data().userName ?? 'Chiến binh',
      score: item.data().score ?? 0,
      createdAt: item.data().createdAt ?? 0
    }));
    onData(scores);
  });
}
