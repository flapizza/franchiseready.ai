import type { Response } from "../types/domain";
import type { AssessmentQuestion } from "../questions/contracts";

type Props = {
  question: AssessmentQuestion;
  selectedValue: Response["value"] | null;
  onSelect: (value: Response["value"]) => void;
};

export function QuestionCard({
  question,
  selectedValue,
  onSelect,
}: Props) {
  const selectedOptionId =
    selectedValue?.type === "single-choice"
      ? selectedValue.optionId
      : null;

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
              className="flex cursor-pointer items-center gap-3 rounded border p-3 transition-colors hover:bg-gray-50"
            >
              <input
                type="radio"
                name={question.id}
                checked={selectedOptionId === option.id}
                onChange={() =>
                  onSelect({
                    type: "single-choice",
                    optionId: option.id,
                  })
                }
              />

              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <p>This question type isn’t supported yet.</p>
      )}
    </div>
  );
}
