"use client";

// import { useCallback, useEffect } from "react";
// import { Roboto } from "next/font/google";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  // ClipboardCheck,
  Loader2,
  // X as NuhUh,
  PlusCircle,
  // RefreshCw,
  // Trash2,
  // Check as YuhUh,
} from "lucide-react";

// import { useFieldArray, useForm, useWatch } from "react-hook-form";
// import { z } from "zod";
import { api } from "~/utils/api";
import { ChoiceEditor } from "./ChoiceEditor";
import { EssayEditor } from "./EssayEditor";
import { BasicLoading } from "./NewLoadingQuestion";

// import {
//   findEssayUpdate,
//   findMultipleChoiceUpdate,
//   useDebounce,
// } from "./utils";
// import type { Props } from "./utils";

export const Questions = ({
  questionId,
  title,
}: {
  questionId: number;
  title: string;
}) => {
  const { toast } = useToast();
  const utils = api.useUtils();

  const choicesIdQuery = api.question.getChoicesIdByQuestionId.useQuery(
    { questionId },
    {
      refetchOnWindowFocus: false,
    },
  );
  const createNewChoiceMutation = api.question.createNewChoice.useMutation({
    async onSuccess() {
      await utils.question.getChoicesIdByQuestionId.invalidate();
    },
    onError(error) {
      toast({
        variant: "destructive",
        title: `Gagal Membuat Soal PG`,
        description: `Terjadi kesalahan, coba lagi nanti. Error: ${error.message}`,
      });
    },
  });

  const essaysIdQuery = api.question.getEssaysIdByQuestionId.useQuery(
    {
      questionId,
    },
    {
      refetchOnWindowFocus: false,
    },
  );
  const createNewEssayMutation = api.question.createNewEssay.useMutation({
    async onSuccess() {
      await utils.question.getEssaysIdByQuestionId.invalidate();
    },
    onError(error) {
      toast({
        variant: "destructive",
        title: `Gagal Membuat Soal PG`,
        description: `Terjadi kesalahan, coba lagi nanti. Error: ${error.message}`,
      });
    },
  });

  return (
    <div className="mt-5 flex flex-col gap-8 pb-16">
      <div className="flex flex-col gap-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Pilihan Ganda
        </h3>

        <div className="flex flex-col gap-5">
          {choicesIdQuery.data?.map((choice, idx) => (
            <ChoiceEditor
              key={choice.iqid}
              choiceIqid={choice.iqid}
              questionNo={idx + 1}
              title={title}
              questionId={questionId}
            />
          ))}

          {choicesIdQuery.isLoading ? (
            <>
              {Array.from({ length: 10 }).map((_, idx) => (
                <BasicLoading key={idx} />
              ))}
            </>
          ) : null}

          {choicesIdQuery.isLoading ? (
            <Button className="h-full w-full p-5" variant="outline" disabled>
              <Loader2 className="h-6 w-6 animate-spin" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-full w-full p-5"
              disabled={createNewChoiceMutation.isLoading}
              onClick={() =>
                createNewChoiceMutation.mutate({
                  questionId,
                })
              }
            >
              {createNewChoiceMutation.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <PlusCircle className="h-6 w-6" />
              )}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Esai
          </h3>

          <div className="flex flex-col gap-5">
            {essaysIdQuery.data?.map((essay, idx) => (
              <EssayEditor
                key={essay.iqid}
                essayIqid={essay.iqid}
                questionNo={idx + 1}
                title={title}
                questionId={questionId}
              />
            ))}

            {essaysIdQuery.isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <BasicLoading key={idx} />
                ))}
              </>
            ) : null}

            {essaysIdQuery.isLoading ? (
              <Button className="h-full w-full p-5" variant="outline" disabled>
                <Loader2 className="h-6 w-6 animate-spin" />
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-full w-full p-5"
                disabled={createNewEssayMutation.isLoading}
                onClick={() =>
                  createNewEssayMutation.mutate({
                    questionId,
                  })
                }
              >
                {createNewEssayMutation.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <PlusCircle className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
