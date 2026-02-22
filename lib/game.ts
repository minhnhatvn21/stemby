import {
  addDoc,
  collection,
  doc,
  increment,
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

// Tạo hồ sơ mới cho người chơi.
export async function createUserProfile(profile: Omit<UserProfile, 'diem_nang_luong'>) {
  await setDoc(doc(db, 'users', profile.id), {
    nickname: profile.nickname,
    avatar: profile.avatar,
    diem_nang_luong: 0,
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
