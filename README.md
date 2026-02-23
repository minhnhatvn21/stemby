# Arena Năng Lượng Xanh 🌍⚡

Dự án mẫu cho học sinh lớp 5 tham gia cuộc thi STEM 2026 chủ đề **Năng lượng bền vững**.

---

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

---

## 3) Hướng dẫn từng bước chạy dự án trên máy tính

> Nếu bạn là người mới, chỉ cần làm đúng theo thứ tự từ **Bước 0** đến **Bước 9**.

### Bước 0: Chuẩn bị trước khi bắt đầu
Bạn cần:
- Máy tính có internet.
- Có tài khoản Google (để dùng Firebase).
- Đã cài trình duyệt Chrome/Edge/Firefox.

---

### Bước 1: Cài Node.js (bắt buộc)
1. Mở trang: https://nodejs.org/
2. Tải bản **LTS** (khuyến nghị).
3. Cài đặt như phần mềm bình thường (Next → Next → Finish).
4. Mở Terminal / Command Prompt để kiểm tra:

```bash
node -v
npm -v
```

Nếu hiện ra số phiên bản (ví dụ `v20.x.x`) là thành công.

---

### Bước 2: Tải source code về máy
Bạn có 2 cách:

#### Cách A (dùng Git)
```bash
git clone <LINK_REPO_CUA_BAN>
cd stemby
```

#### Cách B (không dùng Git)
- Vào GitHub repo → **Code** → **Download ZIP**.
- Giải nén ZIP.
- Mở thư mục dự án bằng VS Code.

---

### Bước 3: Cài thư viện của dự án
Mở terminal ngay trong thư mục dự án, chạy:

```bash
npm install
```

> Nếu mạng chậm, đợi 2–5 phút. Chỉ cần chạy lệnh này **1 lần** khi mới tải code.

---

### Bước 4: Tạo dự án Firebase
1. Vào Firebase Console: https://console.firebase.google.com/
2. Bấm **Create a project**.
3. Đặt tên (ví dụ: `arena-nang-luong-xanh`).
4. Bấm Continue đến khi tạo xong.

---

### Bước 5: Tạo Firestore Database
1. Trong Firebase, vào **Firestore Database**.
2. Bấm **Create database**.
3. Chọn **Start in test mode** (để học và thử nhanh).
4. Chọn location (gần khu vực của bạn) → bấm Enable.

---

### Bước 6: Tạo Web App và lấy Firebase Config
1. Trong Firebase project, vào **Project settings** (biểu tượng bánh răng).
2. Kéo xuống mục **Your apps**.
3. Chọn biểu tượng Web `</>` để tạo app web.
4. Đặt tên app (ví dụ: `arena-web`) → Register app.
5. Firebase sẽ hiện một đoạn config giống:

```js
const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...'
};
```

Giữ màn hình này để copy thông tin.

---

### Bước 7: Tạo file môi trường `.env.local`
Trong thư mục dự án, chạy:

```bash
cp .env.example .env.local
```

Sau đó mở file `.env.local` và điền dữ liệu Firebase vừa copy:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

> Lưu ý: không để dấu nháy `'` hoặc `"` quanh giá trị.

---

### Bước 8: Chạy dự án
Trong terminal của thư mục dự án:

```bash
npm run dev
```

Khi thấy thông báo kiểu `ready - started server on 0.0.0.0:3000` thì mở trình duyệt:

👉 http://localhost:3000

---

### Bước 9: Kiểm tra app hoạt động đúng
Khi vào web, hãy thử theo checklist:

- [ ] Nhập tên chiến binh + chọn avatar + bấm **Vào đấu trường**.
- [ ] Bấm **Đã hiểu (+10 điểm)** xem điểm tăng.
- [ ] Khi đủ 30 điểm, trả lời thử thách ở Thẻ 2.
- [ ] Điền form Thẻ 3 và bấm gửi ý tưởng.
- [ ] Xem bảng xếp hạng Thẻ 4 có cập nhật không.

Sau đó quay lại Firebase → Firestore Database để xem có dữ liệu trong:
- `users`
- `ideas`

---

## 4) Lỗi thường gặp và cách sửa nhanh

### Lỗi 1: `npm install` bị lỗi
- Kiểm tra internet.
- Đảm bảo Node.js cài đúng.
- Thử xóa cache và cài lại:

```bash
npm cache clean --force
npm install
```

### Lỗi 2: Chạy `npm run dev` nhưng không mở được web
- Kiểm tra terminal có lỗi đỏ không.
- Đảm bảo đang đứng đúng thư mục có `package.json`.
- Thử đổi cổng:

```bash
npm run dev -- -p 3001
```

Mở: http://localhost:3001

### Lỗi 3: Firebase không ghi dữ liệu
- Kiểm tra `.env.local` đã điền đúng chưa.
- Tắt mở lại server sau khi sửa env:
  1) `Ctrl + C`
  2) `npm run dev`
- Kiểm tra Firestore đang ở **test mode** khi thử nghiệm.

---

## 5) Logic game (liên kết chặt chẽ)
- **Đăng nhập/Hồ sơ:** nhập tên + chọn avatar -> tạo document ở collection `users` với `diem_nang_luong = 0`.
- **Thẻ 1 - Trạm Luyện Tập:** đọc kiến thức và bấm **Đã hiểu** -> +10 điểm.
- **Thẻ 2 - Đấu Trường Sinh Tồn:** cần tối thiểu 30 điểm mới chơi; trả lời đúng -> +20 điểm.
- **Thẻ 3 - Xưởng Sáng Chế:** nhập 3 trường Gốc rễ/Thân cây/Tán cây -> lưu vào collection `ideas` và +50 điểm.
- **Thẻ 4 - Bảng Tương Tác:** đọc collection `users` realtime, sắp xếp giảm dần theo điểm, hiển thị top 5.

---

## 6) Đưa code lên GitHub

```bash
git init
git add .
git commit -m "feat: arena nang luong xanh"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

---

## 7) Deploy lên Vercel
1. Đăng nhập https://vercel.com/ bằng GitHub.
2. Bấm **Add New Project**.
3. Import repo vừa push.
4. Trong phần **Environment Variables**, thêm toàn bộ biến `NEXT_PUBLIC_FIREBASE_*` giống `.env.local`.
5. Bấm **Deploy**.
6. Chờ vài phút để nhận link website online.

---

## 8) Gợi ý luật Firestore (mẫu học tập)

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
