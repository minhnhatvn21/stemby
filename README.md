# Arena Năng Lượng Xanh 🌍⚡

Dự án mẫu cho học sinh lớp 5 tham gia cuộc thi STEM 2026 chủ đề **Năng lượng bền vững**.

## 1) Công nghệ sử dụng
- **Frontend:** Next.js 14 + React + Tailwind CSS.
- **Database:** Firebase Firestore (collection `users` và `ideas`).
- **Triển khai:** GitHub + Vercel.

## 2) Cấu trúc thư mục

```bash
arena-nang-luong-xanh/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx             # Màn hình đăng nhập + 4 thẻ game
├─ lib/
│  ├─ firebase.ts          # Kết nối Firebase
│  └─ game.ts              # Logic lưu user, cộng điểm, gửi ý tưởng, leaderboard
├─ .env.example
├─ package.json
├─ tailwind.config.ts
└─ README.md
```

## 3) Chạy dự án ở máy local

### Bước 1: Cài Node.js
- Cài Node.js bản 18 hoặc 20 tại trang chủ Node.js.

### Bước 2: Cài thư viện
```bash
npm install
```

### Bước 3: Tạo Firebase project
1. Vào [Firebase Console](https://console.firebase.google.com/).
2. Bấm **Create a project**.
3. Đặt tên dự án (ví dụ: `arena-nang-luong-xanh`).
4. Vào **Project settings** > **Your apps** > chọn biểu tượng Web (`</>`).
5. Đăng ký app web, sau đó copy phần config.

### Bước 4: Tạo Firestore Database
1. Vào menu **Firestore Database**.
2. Bấm **Create database**.
3. Chọn **Start in test mode** để thử nhanh.
4. Chọn khu vực gần bạn nhất.

### Bước 5: Tạo biến môi trường
1. Copy file mẫu:
```bash
cp .env.example .env.local
```
2. Dán config Firebase vào `.env.local`.

Ví dụ:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
```

### Bước 6: Chạy web
```bash
npm run dev
```
Mở `http://localhost:3000`.

## 4) Logic game (liên kết chặt chẽ)
- **Đăng nhập/Hồ sơ:** nhập tên + chọn avatar -> tạo document ở collection `users` với `diem_nang_luong = 0`.
- **Thẻ 1 - Trạm Luyện Tập:** đọc kiến thức và bấm **Đã hiểu** -> +10 điểm.
- **Thẻ 2 - Đấu Trường Sinh Tồn:** cần tối thiểu 30 điểm mới chơi; trả lời đúng -> +20 điểm.
- **Thẻ 3 - Xưởng Sáng Chế:** nhập 3 trường Gốc rễ/Thân cây/Tán cây -> lưu vào collection `ideas` và +50 điểm.
- **Thẻ 4 - Bảng Tương Tác:** đọc collection `users` realtime, sắp xếp giảm dần theo điểm, hiển thị top 5.

## 5) Đưa code lên GitHub

```bash
git init
git add .
git commit -m "feat: arena nang luong xanh"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

## 6) Deploy lên Vercel
1. Đăng nhập [Vercel](https://vercel.com/) bằng GitHub.
2. Bấm **Add New Project**.
3. Import repo vừa push.
4. Trong phần **Environment Variables**, thêm các biến `NEXT_PUBLIC_FIREBASE_*` giống `.env.local`.
5. Bấm **Deploy**.
6. Chờ vài phút để nhận link website online.

## 7) Gợi ý luật Firestore (mẫu học tập)

> Chỉ dùng để học/demo. Khi thi thật cần siết bảo mật kỹ hơn.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }

    match /ideas/{ideaId} {
      allow read, write: if true;
    }
  }
}
```
