# STEMBY Battle - MVP

Web app Next.js cho học sinh tiểu học tham gia thi STEM chủ đề năng lượng xanh với giao diện game rực lửa.

## Stack
- Next.js App Router + TypeScript
- TailwindCSS + Framer Motion
- Firebase Auth (Email/Password) + Firestore Realtime (onSnapshot)
- Deploy Vercel

## Tính năng chính
- Đăng ký / đăng nhập Email+Password.
- Phân quyền `student` / `admin` bằng trường `users.role`.
- Route bảo vệ: `/dashboard`, `/battle/*`, `/admin/*`.
- Module 1 (Chiến Binh): luyện tập trắc nghiệm cá nhân, phản hồi đúng/sai + thanh năng lượng.
- Module 2 (Hợp Sức Tác Chiến): bản đồ grid, leaderboard realtime, gửi đáp án chống duplicate bằng transaction.
- Module 3 (Nhanh Như Chớp): countdown lớn, bảng điểm cập nhật tức thời.
- Admin dashboard + quản lý câu hỏi, phiên, đội, kết quả.
- AI tạo câu hỏi mock qua `generateQuestionsAI()` để dễ thay thế provider.

## Data model Firebase (collections)
- `users`, `questions`, `teams`, `sessions`, `sessionQuestions`, `answers`, `results`, `practiceAttempts`, `scoreboards`.

## Environment variables
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
# optional
GEMINI_API_KEY=
```

## Run local
```bash
npm install
npm run dev
```

## Deploy Vercel
1. Push repo lên GitHub.
2. Vào Vercel -> Import project.
3. Set toàn bộ ENV Firebase.
4. Deploy.

## Firebase setup
1. Tạo project Firebase.
2. Enable Authentication Email/Password.
3. Tạo Firestore database (production mode).
4. Copy `firestore.rules` vào Firebase Rules.
5. Tạo user admin: trong document `users/{uid}`, đặt `role = "admin"`.

## Realtime & fairness
- Ghi nhận thời điểm bằng `serverTimestamp()`.
- Module 2/3 gọi `submitAnswerOnce()` sử dụng Firestore transaction:
  - Mỗi actor/team chỉ có 1 answer key duy nhất cho mỗi câu.
  - Chốt winner đầu tiên đúng và cập nhật scoreboard atomically.
- Test bằng nhiều tab trình duyệt để mô phỏng nhiều học sinh/đội cùng lúc.

## Deploy notes
- App tối ưu mobile bằng UI nhẹ, particle đơn giản.
- Có thể mở rộng bằng Cloud Functions để chấm winner phía server mạnh hơn.
