import { ModuleType } from "./question";

export interface BattleSession {
  id?: string;
  moduleType: Extract<ModuleType, "team-battle" | "flash">;
  title: string;
  code: string;
  status: "draft" | "scheduled" | "live" | "ended";
  questionIds: string[];
  teamIds?: string[];
  startAt: string;
  questionDurationSec: number;
  intervalSec: number;
  currentQuestionIndex: number;
  createdBy: string;
  createdAt?: string;
}
