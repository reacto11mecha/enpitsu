"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@enpitsu/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import { api } from "~/trpc/react";
import { ChoiceEditor } from "./ChoiceEditor";
import { EligibleStatus } from "./EligibleStatus";
import { EssayEditor } from "./EssayEditor";
import { BasicLoading } from "./NewLoadingQuestion";

const usercolors = [
  "#30bced",
  "#6eeb83",
  "#ee6352",
  "#9ac2c9",
  "#8acb88",
  "#1be7ff",
];
const getColor = () =>
  usercolors[Math.floor(Math.random() * usercolors.length)];

export interface ICustomEvent {
  type: string;
  event: string;
  clientID: number;
}

export const Questions = ({
  questionId,
  title,
  userName,
  userImage,
}: {
  questionId: number;
  title: string;
  userName: string;
  userImage: string;
}) => {
  const utils = api.useUtils();

  const [eligibleRefetchInterval, setERI] = useState(0);

  const yDoc = useMemo(() => new Y.Doc(), []);
  const yProvider = useMemo(
    () =>
      new WebrtcProvider(`question-${questionId}`, yDoc, {
        signaling: ["ws://localhost:4444"],
      }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const choicesIdQuery = api.question.getChoicesIdByQuestionId.useQuery(
    { questionId },
    {
      refetchOnWindowFocus: false,
    },
  );
  const createNewChoiceMutation = api.question.createNewChoice.useMutation({
    async onSuccess() {
      await utils.question.getChoicesIdByQuestionId.invalidate();
      await utils.question.getEligibleStatusFromQuestion.invalidate();

      const customEvent = yDoc.getMap("customEvents");
      customEvent.set("enpitsu_custom_event", {
        type: "choice",
        event: "create",
        clientID: yDoc.clientID,
      });
    },
    onError(error) {
      toast.error(`Gagal Membuat Soal PG`, {
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
      await utils.question.getEligibleStatusFromQuestion.invalidate();

      const customEvent = yDoc.getMap("customEvents");
      customEvent.set("enpitsu_custom_event", {
        type: "essay",
        event: "create",
        clientID: yDoc.clientID,
      });
    },
    onError(error) {
      toast.error(`Gagal Membuat Soal Esai`, {
        description: `Terjadi kesalahan, coba lagi nanti. Error: ${error.message}`,
      });
    },
  });

  const eligibleQuestionStatus =
    api.question.getEligibleStatusFromQuestion.useQuery(
      { questionId },
      {
        refetchOnWindowFocus: false,
        refetchInterval: eligibleRefetchInterval,
      },
    );

  useEffect(() => {
    yProvider.awareness.setLocalStateField("user", {
      name: userName,
      color: getColor(),
      image: userImage,
    });

    const customEvents = yDoc.getMap<ICustomEvent>("customEvents");

    const eventListener = (event: Y.YMapEvent<ICustomEvent>) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      void event.changes.keys.forEach(async (_change, key) => {
        if (key === "enpitsu_custom_event") {
          const eventData = customEvents.get(key)!;

          if (eventData.clientID !== yDoc.clientID) {
            if (eventData.type === "choice") {
              switch (eventData.event) {
                case "delete":
                case "create": {
                  await utils.question.getChoicesIdByQuestionId.invalidate();
                  await utils.question.getEligibleStatusFromQuestion.invalidate();

                  break;
                }

                default: {
                  break;
                }
              }

              // this is an essay event handler
            } else {
              switch (eventData.event) {
                case "delete":
                case "create": {
                  await utils.question.getEssaysIdByQuestionId.invalidate();
                  await utils.question.getEligibleStatusFromQuestion.invalidate();

                  break;
                }

                default: {
                  break;
                }
              }
            }
          }
        }
      });
    };

    customEvents.observe(eventListener);

    return () => {
      customEvents.unobserve(eventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              yDoc={yDoc}
              yProvider={yProvider}
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
                yDoc={yDoc}
                yProvider={yProvider}
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
          yProvider={yProvider}
        />
      </div>
    </div>
  );
};
