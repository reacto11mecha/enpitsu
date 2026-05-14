import type { DetailedError, TQuestionForCheck } from "./index";

export function checkMultipleChoices(
  params: TQuestionForCheck,
): DetailedError[] {
  const allDetectedError = params.multipleChoices.map((choice, idx) => {
    const errorMessages = [];

    const noQuestion = choice.isQuestionEmpty;
    const someOfAnswerOptionsAreEmpty = choice.options.some(
      (opt) => opt.isEmpty,
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
      type: "choice" as DetailedError["type"],
      iqid: choice.iqid,
      errorMessage: errorMessages.join(" "),
    };
  });

  return allDetectedError.filter((d) => d !== null);
}

export function checkEssays(params: TQuestionForCheck): DetailedError[] {
  const allDetectedError = params.essays.map((essay, idx) => {
    const errorMessages = [];

    const noQuestion = essay.isQuestionEmpty;
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
      type: "essay" as DetailedError["type"],
      iqid: essay.iqid,
      errorMessage: errorMessages.join(" "),
    };
  });

  return allDetectedError.filter((d) => d !== null);
}
