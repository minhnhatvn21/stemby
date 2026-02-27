import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { Question } from "@/types/question";
import { BattleSession } from "@/types/session";

export const questionsCol = collection(db, "questions");
export const sessionsCol = collection(db, "sessions");

export async function createQuestion(question: Omit<Question, "createdAt" | "updatedAt">) {
  return addDoc(questionsCol, { ...question, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function listPublishedQuestions(moduleType?: string) {
  const q = moduleType
    ? query(questionsCol, where("status", "==", "published"), where("moduleType", "==", moduleType))
    : query(questionsCol, where("status", "==", "published"));
  return getDocs(q);
}

export function listenLiveSessions(cb: (rows: BattleSession[]) => void) {
  return onSnapshot(query(sessionsCol, orderBy("createdAt", "desc")), (snap) => {
    cb(snap.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as BattleSession) })));
  });
}

export async function createSession(payload: Omit<BattleSession, "createdAt" | "currentQuestionIndex">) {
  return addDoc(sessionsCol, { ...payload, currentQuestionIndex: 0, createdAt: serverTimestamp() });
}

export async function submitAnswerOnce({
  sessionId,
  questionId,
  actorId,
  answerIndex,
  isCorrect,
  moduleType,
  teamId
}: {
  sessionId: string;
  questionId: string;
  actorId: string;
  answerIndex: number;
  isCorrect: boolean;
  moduleType: "team-battle" | "flash";
  teamId?: string;
}) {
  const key = moduleType === "team-battle" ? `${sessionId}_${questionId}_${teamId}` : `${sessionId}_${questionId}_${actorId}`;
  const answerRef = doc(db, "answers", key);
  const resultRef = doc(db, "sessionQuestions", `${sessionId}_${questionId}`);

  await runTransaction(db, async (trx) => {
    const existing = await trx.get(answerRef);
    if (existing.exists()) return;

    trx.set(answerRef, {
      sessionId,
      questionId,
      moduleType,
      userId: actorId,
      teamId: teamId ?? null,
      answerIndex,
      isCorrect,
      submittedAt: serverTimestamp()
    });

    const resultSnap = await trx.get(resultRef);
    const resultData = resultSnap.exists() ? resultSnap.data() : null;

    if (isCorrect && !resultData?.winnerResolved) {
      trx.set(resultRef, {
        sessionId,
        questionId,
        winnerResolved: true,
        winnerUserId: moduleType === "flash" ? actorId : null,
        winnerTeamId: moduleType === "team-battle" ? teamId : null,
        resolvedAt: serverTimestamp()
      }, { merge: true });

      const scoreRef = doc(db, "scoreboards", sessionId);
      const scoreDoc = await trx.get(scoreRef);
      const scores = scoreDoc.exists() ? scoreDoc.data().scores || {} : {};
      const scoreKey = moduleType === "team-battle" ? (teamId as string) : actorId;
      scores[scoreKey] = (scores[scoreKey] || 0) + 100;
      trx.set(scoreRef, { sessionId, scores, updatedAt: serverTimestamp() }, { merge: true });
    }
  });
}

export async function updateSession(id: string, data: Partial<BattleSession>) {
  await updateDoc(doc(db, "sessions", id), data);
}

export async function upsertTeam(teamId: string, data: { name: string; code: string; color: string; memberIds: string[] }) {
  await setDoc(doc(db, "teams", teamId), { ...data, createdAt: serverTimestamp() }, { merge: true });
}
