import type { WebsocketProvider } from "y-websocket";
import { lazy, memo, Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@enpitsu/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@enpitsu/ui/card";
import { Checkbox } from "@enpitsu/ui/checkbox";
import { Label } from "@enpitsu/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@enpitsu/ui/popover";
import { RadioGroup, RadioGroupItem } from "@enpitsu/ui/radio-group";
import { Separator } from "@enpitsu/ui/separator";
import { Skeleton } from "@enpitsu/ui/skeleton";
import {
  ClipboardCheck,
  Loader2,
  X as NuhUh,
  RefreshCw,
  Trash2,
  Check as YuhUh,
} from "lucide-react";
import { useY } from "react-yjs";
import { v4 as uuidv4 } from "uuid";
import * as Y from "yjs";

const Editor = lazy(() => import("./Editor"));

export type YOption = Y.Map<{
  order: number;
  answer: Y.Text;
}>;

// Define a type for a multiple choice question.
export type YMultipleChoice = Y.Map<{
  id: number;
  question: Y.Text;
  options: Y.Array<YOption>;
  correctAnswerOrder: number;
}>;

export function createNewMultipleChoice(
  yArray: Y.Array<YMultipleChoice>,
  optionsLength: number,
) {
  const initialChoice = new Y.Map();

  initialChoice.set("id", uuidv4());
  initialChoice.set("question", new Y.Text(""));

  const yOptions = new Y.Array();

  for (let i = 1; i <= optionsLength; i++) {
    const option = new Y.Map();

    option.set("order", i);
    option.set("answer", new Y.Text(""));

    yOptions.push([option]);
  }

  initialChoice.set("options", yOptions);
  initialChoice.set("correctAnswerOrder", 0);

  yArray.push([initialChoice]);
}

interface Props {
  yArray: Y.Array<YMultipleChoice>;
  awareness: WebsocketProvider["awareness"];
  title: string;
  optionsLength: number;
}

const Loading = () => <Skeleton className="h-10 w-full" />;

export const ChoiceEditor = memo(function ChoiceEditor({
  yArray,
  awareness,
  title,
  optionsLength,
}: Props) {
  const [choices, setChoices] = useState<{ id: string; idx: number }[]>([]);

  useEffect(() => {
    const observeChoices = (arr, tx) => {
      setChoices(yArray.toJSON().map((d, idx) => ({ id: d.id, idx })));
    };

    yArray.observe(observeChoices);

    return () => {
      yArray.unobserve(observeChoices);
    };
  }, [yArray]);

  return (
    <>
      {choices.map((choice) => (
        <IndividualChoice
          key={choice.id}
          id={choice.id}
          index={choice.idx}
          awareness={awareness}
          yArray={yArray}
          title={title}
          optionsLength={optionsLength}
        />
      ))}
    </>
  );
});

// no pun intended here
const IndividualChoice = memo(function IndividualChoice({
  id,
  index,
  yArray,
  awareness,
  title,
  optionsLength,
}: Props & {
  id: string;
  index: number;
}) {
  const currentYChoice = useMemo(() => yArray.get(index), []);
  const realtimeData = useY(currentYChoice);

  if (!currentYChoice) return null;

  return (
    <Card id={`choice-${id}`}>
      <CardHeader>
        <CardTitle>Soal Nomor {index + 1}</CardTitle>
        <CardDescription className="text-muted-foreground">
          Soal: {title}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <Suspense fallback={<Loading />}>
          <Editor
            yText={currentYChoice.get("question")}
            awareness={awareness}
          />
        </Suspense>

        <div className="flex flex-col gap-3">
          {Array.from({ length: optionsLength }).map((_, idx) => (
            <div
              className="flex flex-row items-center gap-3"
              onPasteCapture={(e) => {
                if (
                  currentYChoice
                    .get("options")
                    .toJSON()
                    .every((opt) => opt.answer === "")
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

                  textArray.forEach((newTxt, idx) => {
                    if (idx < optionsLength)
                      currentYChoice
                        .get("options")
                        .get(idx)
                        .get("answer")
                        .insert(0, newTxt);
                  });
                }
              }}
              key={idx}
            >
              <Checkbox
                checked={realtimeData.correctAnswerOrder === idx + 1}
                disabled
                className="rounded-full"
              />

              <Suspense fallback={<Loading />}>
                <Editor
                  yText={currentYChoice.get("options").get(idx).get("answer")}
                  awareness={awareness}
                />
              </Suspense>
            </div>
          ))}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-row p-5">
        <div className="flex w-full flex-row justify-between">
          <div className="flex flex-row items-center gap-5">
            <Popover>
              <PopoverTrigger className="flex flex-row items-center gap-2 text-sky-600 dark:text-sky-500">
                <ClipboardCheck />
                Kunci jawaban
              </PopoverTrigger>
              <PopoverContent className="space-y-4">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Pilih jawaban benar
                </h4>

                <RadioGroup
                  onValueChange={(val) =>
                    currentYChoice.set("correctAnswerOrder", parseInt(val))
                  }
                  defaultValue={String(realtimeData.correctAnswerOrder)}
                  className="flex flex-col space-y-1"
                >
                  {realtimeData.options.map((option) => (
                    <div
                      className="flex items-center space-x-3 space-y-0"
                      key={option.order}
                    >
                      <RadioGroupItem
                        value={String(option.order)}
                        id={`${index}-option-${option.order}`}
                      />
                      <Label htmlFor={`${index}-option-${option.order}`}>
                        Opsi {option.order}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </PopoverContent>
            </Popover>

            {realtimeData.correctAnswerOrder > 0 &&
            realtimeData.correctAnswerOrder <= optionsLength ? (
              <YuhUh className="h-8 w-8 text-green-600 dark:text-green-500" />
            ) : (
              <NuhUh className="h-8 w-8 text-red-600 dark:text-red-500" />
            )}
          </div>

          <Button variant="ghost" onClick={() => yArray.delete(index, 1)}>
            <span className="sr-only">Hapus pertanyaan</span>
            <Trash2 />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});
