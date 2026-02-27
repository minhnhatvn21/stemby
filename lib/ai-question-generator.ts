import { z } from "zod";

const inputSchema = z.object({
  topic: z.string().min(2),
  difficulty: z.enum(["easy", "medium", "hard"]),
  amount: z.number().min(1).max(20),
  ageGroup: z.string().default("Lớp 5")
});

export async function generateQuestionsAI(input: z.infer<typeof inputSchema>) {
  const validated = inputSchema.parse(input);
  return Array.from({ length: validated.amount }).map((_, idx) => ({
    moduleType: "warrior" as const,
    topic: validated.topic,
    difficulty: validated.difficulty,
    question: `[AI MOCK ${idx + 1}] Nguồn năng lượng nào tái tạo được?`,
    options: ["Than đá", "Mặt trời", "Dầu mỏ", "Khí đốt"],
    correctIndex: 1,
    explanation: "Năng lượng mặt trời là năng lượng tái tạo, sạch và bền vững.",
    source: "ai" as const,
    status: "draft" as const
  }));
}
