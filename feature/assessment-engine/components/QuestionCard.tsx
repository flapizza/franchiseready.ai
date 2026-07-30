import type { AssessmentQuestion } from "../questions/contracts";

type Props = {
  question: AssessmentQuestion;
};

export function QuestionCard({ question }: Props) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        {question.prompt}
      </h2>

      {"options" in question && question.options ? (
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded border p-3 hover:bg-gray-50"
            >
              <input
                type="radio"
                name={question.id}
                disabled
              />

              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <p>This question type isn't supported yet.</p>
      )}
    </div>
  );
}