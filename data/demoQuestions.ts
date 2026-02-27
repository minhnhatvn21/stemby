import { Question } from "@/types/question";

export const demoQuestions: Question[] = [
  {
    moduleType: "warrior",
    topic: "Điện mặt trời",
    difficulty: "easy",
    question: "Pin mặt trời tạo ra điện từ nguồn nào?",
    options: ["Ánh sáng mặt trời", "Nước biển", "Than đá", "Dầu diesel"],
    correctIndex: 0,
    explanation: "Pin mặt trời chuyển đổi ánh sáng thành điện năng.",
    source: "admin",
    status: "published",
    createdBy: "seed"
  },
  {
    moduleType: "warrior",
    topic: "Tiết kiệm điện",
    difficulty: "medium",
    question: "Thói quen nào giúp tiết kiệm điện?",
    options: ["Bật đèn cả ngày", "Rút sạc khi không dùng", "Mở tủ lạnh liên tục", "Bật TV khi ngủ"],
    correctIndex: 1,
    explanation: "Rút thiết bị khi không dùng giảm điện năng chờ.",
    source: "admin",
    status: "published",
    createdBy: "seed"
  }
];
