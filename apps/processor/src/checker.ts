import type { DetailedError, TQuestionForCheck } from "./index";

const isEmpty = (str: string) => str === "" || str === "<p><br></p>";

type DetailOverride = Omit<DetailedError, "type"> & {
  type: string;
};

export function checkMultipleChoices(
  choices: TQuestionForCheck["multipleChoices"],
): DetailedError[] {
  const allDetectedError = choices
    .map((choice, idx) => {
      const errorMessages = [];

      const noQuestion = isEmpty(choice.question.trim());
      const someOfAnswerOptionsAreEmpty = choice.options.some((opt) =>
        isEmpty(opt.answer),
      );
      const noAnswerOrder = choice.correctAnswerOrder === 0;

      if (!noQuestion && !someOfAnswerOptionsAreEmpty && !noAnswerOrder)
        return null;

      errorMessages.push(`SOAL NOMOR: ${idx + 1};`);

      if (noQuestion) {
        errorMessages.push("Pertanyaan masih kosong.");
      }

      if (someOfAnswerOptionsAreEmpty) {
        errorMessages.push("Semua atau beberapa opsi jawaban masih kosong.");
      }

      if (noAnswerOrder) {
        errorMessages.push("Belum memilih jawaban benar pada kunci jawaban.");
      }

      return {
        type: "choice",
        iqid: choice.iqid,
        errorMessage: errorMessages.join(" "),
      };
    })
    .filter((d) => !!d) satisfies DetailOverride[];

  return allDetectedError as unknown as DetailedError[];
}

export function checkEssays(
  essays: TQuestionForCheck["essays"],
): DetailedError[] {
  const allDetectedError = essays
    .map((essay, idx) => {
      const errorMessages = [];

      const noQuestion = isEmpty(essay.question.trim());
      const noAnswer = essay.answer.length === 0 || essay.answer === "";

      if (!noQuestion && !noAnswer) return null;

      errorMessages.push(`SOAL NOMOR: ${idx + 1};`);

      if (noQuestion) {
        errorMessages.push("Pertanyaan masih kosong.");
      }

      if (noAnswer) {
        errorMessages.push(
          "Belum menambahkan kunci jawaban pada kolom input jawaban.",
        );
      }

      return {
        type: "essay",
        iqid: essay.iqid,
        errorMessage: errorMessages.join(" "),
      };
    })
    .filter((d) => !!d) satisfies DetailOverride[];

  return allDetectedError as unknown as DetailedError[];
}
