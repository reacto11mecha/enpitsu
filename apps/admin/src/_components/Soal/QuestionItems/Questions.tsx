"use client";

import { useEffect, useState } from "react";
import { Button } from "@enpitsu/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "~/trpc/react";
import { ChoiceEditor } from "./ChoiceEditor";
import { EligibleStatus } from "./EligibleStatus";
import { EssayEditor } from "./EssayEditor";
import { BasicLoading } from "./NewLoadingQuestion";

export const Questions = ({
  questionId,
  title,
}: {
  questionId: number;
  title: string;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [eligibleRefetchInterval, setERI] = useState(0);

  const choicesIdQuery = useQuery(
    trpc.question.getChoicesIdByQuestionId.queryOptions(
      { questionId },
      {
        refetchOnWindowFocus: false,
      },
    ),
  );
  const createNewChoiceMutation = useMutation(
    trpc.question.createNewChoice.mutationOptions({
      async onSuccess() {
        await queryClient.invalidateQueries(trpc.question.pathFilter());
      },
      onError(error) {
        toast.error(`Gagal Membuat Soal PG`, {
          description: `Terjadi kesalahan, coba lagi nanti. Error: ${error.message}`,
        });
      },
    }),
  );

  const essaysIdQuery = useQuery(
    trpc.question.getEssaysIdByQuestionId.queryOptions(
      {
        questionId,
      },
      {
        refetchOnWindowFocus: false,
      },
    ),
  );
  const createNewEssayMutation = useMutation(
    trpc.question.createNewEssay.mutationOptions({
      async onSuccess() {
        await queryClient.invalidateQueries(trpc.question.pathFilter());
      },
      onError(error) {
        toast.error(`Gagal Membuat Soal Esai`, {
          description: `Terjadi kesalahan, coba lagi nanti. Error: ${error.message}`,
        });
      },
    }),
  );

  const eligibleQuestionStatus = useQuery(
    trpc.question.getEligibleStatusFromQuestion.queryOptions(
      { questionId },
      {
        refetchOnWindowFocus: false,
        refetchInterval: eligibleRefetchInterval,
      },
    ),
  );

  useEffect(() => {
    if (eligibleQuestionStatus.data) {
      if (
        eligibleRefetchInterval === 0 &&
        eligibleQuestionStatus.data.eligible === "PROCESSING"
      )
        setERI(5000);
      else if (
        eligibleRefetchInterval === 5000 &&
        eligibleQuestionStatus.data.eligible === "ELIGIBLE"
      )
        setERI(0);
    }
  }, [eligibleQuestionStatus.data, eligibleRefetchInterval]);

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

          {choicesIdQuery.isPending ? (
            <>
              {Array.from({ length: 10 }).map((_, idx) => (
                <BasicLoading key={idx} />
              ))}
            </>
          ) : null}

          {choicesIdQuery.isPending ? (
            <Button className="h-full w-full p-5" variant="outline" disabled>
              <Loader2 className="h-6 w-6 animate-spin" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-full w-full p-5"
              disabled={createNewChoiceMutation.isPending}
              onClick={() =>
                createNewChoiceMutation.mutate({
                  questionId,
                })
              }
            >
              {createNewChoiceMutation.isPending ? (
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

            {essaysIdQuery.isPending ? (
              <>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <BasicLoading key={idx} />
                ))}
              </>
            ) : null}

            {essaysIdQuery.isPending ? (
              <Button className="h-full w-full p-5" variant="outline" disabled>
                <Loader2 className="h-6 w-6 animate-spin" />
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-full w-full p-5"
                disabled={createNewEssayMutation.isPending}
                onClick={() =>
                  createNewEssayMutation.mutate({
                    questionId,
                  })
                }
              >
                {createNewEssayMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <PlusCircle className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>

        <EligibleStatus
          isPending={eligibleQuestionStatus.isPending}
          isError={eligibleQuestionStatus.isError}
          data={eligibleQuestionStatus.data}
        />
      </div>
    </div>
  );
};
