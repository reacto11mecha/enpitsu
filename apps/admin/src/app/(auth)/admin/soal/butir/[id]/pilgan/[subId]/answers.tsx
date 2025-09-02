"use client";

import { useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheckBig, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import type { EditorRefApi } from "~/_components/Editor/MainEditor";
import { MainEditor } from "~/_components/Editor/MainEditor";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/trpc/react";

export function AnswerOptions({
  cursorColor,
  options,
  choiceId,
  username,
}: {
  cursorColor: string;
  choiceId: number;
  options: { idx: number; roomName: string }[];
  username: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const correctAnswerOptionQuery = useQuery(
    trpc.question.getCorrectAnswerSpecificChoice.queryOptions(
      { id: choiceId },
      {
        refetchInterval: 5000,
      },
    ),
  );
  const correctAnswerOptionMutation = useMutation(
    trpc.question.setCorrectAnswerSpecificChoice.mutationOptions({
      onError(err) {
        toast.error("Gagal memperbarui jawaban benar", {
          description: err.message,
        });
      },
      async onSettled() {
        await queryClient.invalidateQueries(
          trpc.question.getCorrectAnswerSpecificChoice.pathFilter(),
        );
      },
    }),
  );

  const editorRefs = useRef<Map<number, EditorRefApi>>(new Map());

  const setRef = useCallback((index: number, el: EditorRefApi | null) => {
    if (el) {
      editorRefs.current.set(index, el);
    } else {
      // Clean up the ref when a component is unmounted.
      editorRefs.current.delete(index);
    }
  }, []);

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <p className="scroll-m-10">Opsi Jawaban :</p>

        {correctAnswerOptionQuery.data?.correctAnswerOrder !== 0 ? (
          <Badge className="bg-green-600 text-sm text-white dark:bg-green-700">
            Jawaban benar pada opsi ke:{" "}
            {correctAnswerOptionQuery.data?.correctAnswerOrder}
          </Badge>
        ) : (
          <Badge variant="secondary">belum ada jawaban benar</Badge>
        )}
      </div>

      <div
        className="space-y-5"
        onPasteCapture={(e) => {
          if (
            Array.from(editorRefs.current.values()).every((editor) =>
              editor.isEmpty(),
            )
          ) {
            e.preventDefault();

            const textArray = e.clipboardData
              .getData("text")
              .trim()
              .split(/\r?\n/)
              .filter((t) => t !== "")
              .map((text) =>
                text
                  .trim()
                  .replace(/^[a-eA-E]\.\s/, "")
                  .trim(),
              );

            editorRefs.current.forEach((editor, idx) => {
              if (textArray[idx]) editor.insertText(textArray[idx]);
            });
          }
        }}
      >
        {options.map((option) => (
          <MainEditor
            key={option.idx}
            cursorColor={cursorColor}
            // @ts-expect-error udah lah begini aja
            ref={(el: EditorRefApi) => setRef(option.idx, el)}
            roomName={option.roomName}
            username={username}
          >
            <div className="flex flex-row items-center gap-2">
              {correctAnswerOptionQuery.data?.correctAnswerOrder ===
              option.idx + 1 ? (
                <Badge className="bg-green-600 text-sm text-white dark:bg-green-700">
                  <CircleCheckBig />
                  jawaban benar
                </Badge>
              ) : (
                <Button
                  disabled={
                    correctAnswerOptionMutation.isPending ||
                    !correctAnswerOptionQuery.isSuccess
                  }
                  variant="outline"
                  onClick={() =>
                    correctAnswerOptionMutation.mutate({
                      id: choiceId,
                      correctAnswer: option.idx + 1,
                    })
                  }
                >
                  {correctAnswerOptionMutation.isPending ||
                  !correctAnswerOptionQuery.isSuccess ? (
                    <Loader2Icon className="animate-spin" />
                  ) : null}
                  Jadikan jawaban benar
                </Button>
              )}
              <p>Pilihan jawaban ke {option.idx + 1}.</p>
            </div>
          </MainEditor>
        ))}
      </div>
    </>
  );
}
