import { ModuleType } from "./question";

export interface Answer {
  sessionId: string;
  questionId: string;
  moduleType: ModuleType;
  userId: string;
  teamId?: string;
  answerIndex: number;
  isCorrect: boolean;
  submittedAt?: string;
  responseTimeMs?: number;
}
