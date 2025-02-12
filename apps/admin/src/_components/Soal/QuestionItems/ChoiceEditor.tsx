import type { WebsocketProvider } from "y-websocket";
import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@enpitsu/ui/card";
import { Separator } from "@enpitsu/ui/separator";
import { useY } from "react-yjs";
import * as Y from "yjs";

import { Editor } from "./Editor";

export interface MultipleChoiceOption {
  order: number;
  answer: Y.Text;
}

// Define the type for a multiple choice question, with the question as a Y.Text.
export interface MultipleChoice {
  question: Y.Text;
  options: Y.Array<MultipleChoiceOption>;
  correctAnswerOrder: number;
}

export type MultipleChoicesMap = Y.Map<MultipleChoice>;

/**
 * Inserts a new multiple choice item into the provided Y.Map.
 * @param map - The global Y.Map containing multiple choice items.
 * @param key - The key to use for the new item (e.g. a stringified id).
 * @param questionText - The question text.
 * @param options - An array of options with their order and answer text.
 * @param correctAnswerOrder - The order number of the correct answer.
 */
export function addMultipleChoice(
  map: MultipleChoicesMap,
  key: string,
  questionText: string,
  options: { order: number; answer: string }[],
  correctAnswerOrder: number,
) {
  // Create a new MultipleChoice item
  const newChoice: MultipleChoice = {
    question: new Y.Text(), // Y.Text for collaborative editing of the question
    options: new Y.Array<MultipleChoiceOption>(), // Y.Array for the options
    correctAnswerOrder,
  };

  // Insert the question text into the Y.Text
  newChoice.question.insert(0, questionText);

  // Process each option
  options.forEach((opt) => {
    const option: MultipleChoiceOption = {
      order: opt.order,
      answer: new Y.Text(), // Y.Text for the option's answer
    };
    option.answer.insert(0, opt.answer);
    newChoice.options.push([option]);
  });

  // Insert the new multiple choice into the map using the provided key.
  map.set(key, newChoice);
}

export const ChoiceEditor = memo(function ChoiceEditor({
  yMap,
  awareness,
  title,
}: {
  yMap: MultipleChoicesMap;
  awareness: WebsocketProvider["awareness"];
  title: string;
}) {
  const choices = useY(yMap);

  return (
    <>
      {Object.keys(choices).length > 0 ? (
        <>
          {Object.keys(choices).map((key, idx) => {
            const multipleChoice = yMap.get(key);
            if (!multipleChoice) return null;

            console.log(multipleChoice.question instanceof Y.Text);

            return (
              <Card key={key} id={`choice-iqid-${key}`}>
                <CardHeader>
                  <CardTitle>Soal Nomor {idx + 1}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Soal: {title}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-5">
                  {/* <Editor yText={multipleChoice.question} awareness={awareness} /> */}
                </CardContent>

                <Separator />

                <CardFooter className="flex flex-row p-5"></CardFooter>
              </Card>
            );
          })}
        </>
      ) : null}
    </>
  );
});
