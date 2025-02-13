"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@enpitsu/ui/button";
import { PlusCircle } from "lucide-react";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import "katex";
import "katex/dist/katex.min.css";
import "quill/dist/quill.snow.css";

import type { YMultipleChoice } from "./ChoiceEditor";
import { ChoiceEditor, createNewMultipleChoice } from "./ChoiceEditor";
import { Presence } from "./Presence";

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

export const Questions = ({
  questionId,
  optionsLength,
  title,
  userName,
  userImage,
}: {
  questionId: number;
  optionsLength: number;
  title: string;
  userName: string;
  userImage: string;
}) => {
  const yDoc = useMemo(() => new Y.Doc(), []);
  const yWebsocket = useMemo(
    () =>
      new WebsocketProvider(
        "ws://localhost:1234",
        `question-${questionId}`,
        yDoc,
      ),
    [],
  );
  const yIndexedDB = useMemo(
    () => new IndexeddbPersistence(`question-${questionId}`, yDoc),
    [],
  );

  const yMultipleChoices: Y.Array<YMultipleChoice> = useMemo(
    () => yDoc.getArray<YMultipleChoice>("multipleChoices"),
    [],
  );

  useEffect(() => {
    yWebsocket.awareness.setLocalStateField("user", {
      name: userName,
      color: getColor(),
      image: userImage,
    });

    window.yMultipleChoices = yMultipleChoices;

    // @ts-expect-error debugging purpose only
    window.Y = Y;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log("re render");

  return (
    <div className="mt-5 flex flex-col gap-8 pb-16">
      <h1>Soal: {title}</h1>
      <div className="flex flex-col gap-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Pilihan Ganda
        </h3>

        <div className="flex flex-col gap-5">
          <ChoiceEditor
            awareness={yWebsocket.awareness}
            yArray={yMultipleChoices}
            title={title}
            optionsLength={optionsLength}
          />

          <Button
            variant="outline"
            className="h-full w-full p-5"
            onClick={() =>
              createNewMultipleChoice(yMultipleChoices, optionsLength)
            }
          >
            <PlusCircle className="!h-6 !w-6" />
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Esai
          </h3>
        </div>

        <Presence awareness={yWebsocket.awareness} />
      </div>
    </div>
  );
};
