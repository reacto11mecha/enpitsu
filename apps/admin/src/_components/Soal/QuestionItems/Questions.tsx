"use client";

// import { useCallback, useEffect } from "react";
// import { Roboto } from "next/font/google";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   ClipboardCheck,
//   Loader2,
//   X as NuhUh,
//   PlusCircle,
//   RefreshCw,
//   Trash2,
//   Check as YuhUh,
// } from "lucide-react";
// import { useFieldArray, useForm, useWatch } from "react-hook-form";
// import { z } from "zod";
import { api } from "~/utils/api";
import { ChoiceEditor } from "./ChoiceEditor";
import { BasicLoading } from "./NewLoadingQuestion";

// import {
//   findEssayUpdate,
//   findMultipleChoiceUpdate,
//   useDebounce,
// } from "./utils";
// import type { Props } from "./utils";

// const robotoFont = Roboto({
//   weight: "400",
//   subsets: ["latin"],
// });

export const Questions = ({
  questionId,
  title,
}: {
  questionId: number;
  title: string;
}) => {
  const choicesIdQuery = api.question.getChoicesIdByQuestionId.useQuery(
    { questionId },
    {
      refetchOnWindowFocus: false,
    },
  );

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
        </div>
      </div>
    </div>
  );
};
