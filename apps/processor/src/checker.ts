import { preparedYjsDocumentSelect } from "@enpitsu/db/client";
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
} from "@platejs/basic-nodes";
import { yTextToSlateElement } from "@slate-yjs/core";
import { createSlateEditor } from "platejs";
// import { applyUpdate, Doc, XmlText } from "yjs";
import * as Y from "yjs";

import type { DetailedError, TQuestionForCheck } from "./index";

const isEmpty = (str: string) => {
  console.log(str);

  return str === "" || str === "<p><br></p>";
};

type DetailOverride = Omit<DetailedError, "type"> & {
  type: string;
};

export async function checkMultipleChoices(
  params: TQuestionForCheck,
): Promise<DetailedError[]> {
  const allDetectedError = await Promise.all(
    params.multipleChoices.map(async (choice, idx) => {
      const errorMessages = [];

      const parentQuestionDoc = new Y.Doc();
      const questionDocBinary = await preparedYjsDocumentSelect.execute({
        documentName: `q-choice-parent_${params.id}-${choice.iqid}`,
      });
      if (questionDocBinary)
        Y.applyUpdate(parentQuestionDoc, questionDocBinary.data);

      const noQuestion = questionDocBinary
        ? createSlateEditor({
            plugins: [
              BaseBoldPlugin,
              BaseItalicPlugin,
              BaseUnderlinePlugin,
              BaseH1Plugin,
              BaseH2Plugin,
              BaseH3Plugin,
              BaseBlockquotePlugin,
            ],

            // @ts-expect-error ekspek aja
            value: yTextToSlateElement(
              parentQuestionDoc.get("content", Y.XmlText),
            ).children,
          }).api.isEmpty()
        : true;

      const resolvedOptionsCheck = await Promise.all(
        Array.from({ length: params.multipleChoiceOptions }).map(
          async (_, optIdx) => {
            const answerDoc = new Y.Doc();
            const answerDocBinary = await preparedYjsDocumentSelect.execute({
              documentName: `q-choice-opt_${params.id}-${choice.iqid}-${optIdx}`,
            });

            if (answerDocBinary) {
              Y.applyUpdate(answerDoc, answerDocBinary.data);

              const editor = createSlateEditor({
                plugins: [
                  BaseBoldPlugin,
                  BaseItalicPlugin,
                  BaseUnderlinePlugin,
                  BaseH1Plugin,
                  BaseH2Plugin,
                  BaseH3Plugin,
                  BaseBlockquotePlugin,
                ],

                // @ts-expect-error ekspek aja
                value: yTextToSlateElement(answerDoc.get("content", Y.XmlText))
                  .children,
              });

              console.log(editor.api.isEmpty());

              return editor.api.isEmpty();
            }

            return true;
          },
        ),
      );
      const someOfAnswerOptionsAreEmpty = resolvedOptionsCheck.some(
        (empty) => empty,
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
    }),
  );

  return allDetectedError.filter((d) => d !== null);
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
