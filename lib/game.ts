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
  where,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

export type UserProfile = {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  fullName: string;
  className: string;
  schoolName: string;
  province: string;
  diem_nang_luong: number;
};

export type RegisterPayload = {
  username: string;
  password: string;
  nickname: string;
  avatar: string;
  fullName: string;
  className: string;
  schoolName: string;
  province: string;
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

// Đăng ký tài khoản mới theo username/password.
export async function registerStudentAccount(payload: RegisterPayload): Promise<UserProfile> {
  const existing = await getDocs(query(collection(db, 'users'), where('username', '==', payload.username), limit(1)));
  if (!existing.empty) {
    throw new Error('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
  }

  const id = crypto.randomUUID();
  const profile: Omit<UserProfile, 'id'> & { password: string; badges: string[]; updatedAt: number } = {
    username: payload.username,
    password: payload.password,
    nickname: payload.nickname,
    avatar: payload.avatar,
    fullName: payload.fullName,
    className: payload.className,
    schoolName: payload.schoolName,
    province: payload.province,
    diem_nang_luong: 0,
    badges: [],
    updatedAt: Date.now()
  };

  await setDoc(doc(db, 'users', id), profile);

  return {
    id,
    username: profile.username,
    nickname: profile.nickname,
    avatar: profile.avatar,
    fullName: profile.fullName,
    className: profile.className,
    schoolName: profile.schoolName,
    province: profile.province,
    diem_nang_luong: 0
  };
}

// Đăng nhập bằng username/password.
export async function loginStudentAccount(username: string, password: string): Promise<UserProfile> {
  const found = await getDocs(
    query(collection(db, 'users'), where('username', '==', username), where('password', '==', password), limit(1))
  );

  if (found.empty) {
    throw new Error('Sai tài khoản hoặc mật khẩu.');
  }

  const docData = found.docs[0];
  const data = docData.data();

  return {
    id: docData.id,
    username: data.username ?? username,
    nickname: data.nickname ?? 'Chiến binh',
    avatar: data.avatar ?? '🌱',
    fullName: data.fullName ?? '',
    className: data.className ?? '',
    schoolName: data.schoolName ?? '',
    province: data.province ?? '',
    diem_nang_luong: data.diem_nang_luong ?? 0
  };
}

// Cộng điểm năng lượng cho người chơi.
export async function addEnergyPoint(userId: string, value: number) {
  await updateDoc(doc(db, 'users', userId), {
    diem_nang_luong: increment(value),
    updatedAt: Date.now()
  });
}

export async function submitIdea(payload: IdeaPayload) {
  await addDoc(collection(db, 'ideas'), {
    ...payload,
    createdAt: Date.now()
  });
}

export function subscribeLeaderboard(onData: (users: UserProfile[]) => void): Unsubscribe {
  const usersQuery = query(collection(db, 'users'), orderBy('diem_nang_luong', 'desc'));

  return onSnapshot(usersQuery, (snapshot) => {
    const users = snapshot.docs.map((item) => ({
      id: item.id,
      username: item.data().username ?? '',
      nickname: item.data().nickname ?? 'Chiến binh',
      avatar: item.data().avatar ?? '🌱',
      fullName: item.data().fullName ?? '',
      className: item.data().className ?? '',
      schoolName: item.data().schoolName ?? '',
      province: item.data().province ?? '',
      diem_nang_luong: item.data().diem_nang_luong ?? 0
    }));

    onData(users);
  });
}

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

export async function submitPvpScore(userId: string, userName: string, score: number) {
  await addDoc(collection(db, 'pvp_scores'), {
    userId,
    userName,
    score,
    createdAt: Date.now()
  });
}

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
