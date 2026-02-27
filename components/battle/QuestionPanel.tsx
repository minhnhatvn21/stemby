import { Question } from "@/types/question";

export default function QuestionPanel({ question, index }: { question: Question; index: number }) {
  return (
    <section className="panel p-4">
      <p className="text-spark">Câu {index + 1} • {question.topic} • {question.difficulty}</p>
      <h2 className="text-xl font-heading mt-2">{question.question}</h2>
    </section>
  );
}
