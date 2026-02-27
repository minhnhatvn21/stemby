export type ModuleType = "warrior" | "team-battle" | "flash";

export interface Question {
  id?: string;
  moduleType: ModuleType;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: "ai" | "admin";
  status: "draft" | "published";
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
