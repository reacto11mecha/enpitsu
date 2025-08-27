"use client";

import { useCallback, useRef } from "react";

import type { EditorRefApi } from "~/_components/Editor/MainEditor";
import { MainEditor } from "~/_components/Editor/MainEditor";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

export function AnswerOptions({
  length,
  id,
  choiceId,
  username,
}: {
  length: number;
  id: number;
  choiceId: number;
  username: string;
}) {
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
    <RadioGroup
      defaultValue=""
      onPaste={(e) => {
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
      {Array.from({ length }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center space-x-3 rounded px-2 py-3"
        >
          <RadioGroupItem disabled value={String(idx)} id={`choice-${idx}`} />
          <div className="w-full">
            <MainEditor
              // @ts-expect-error udah lah begini aja
              ref={(el: EditorRefApi) => setRef(idx, el)}
              roomName={`q-choice-opt_${id}-${choiceId}-${idx}`}
              username={username}
            />
          </div>
        </div>
      ))}
    </RadioGroup>
  );
}
