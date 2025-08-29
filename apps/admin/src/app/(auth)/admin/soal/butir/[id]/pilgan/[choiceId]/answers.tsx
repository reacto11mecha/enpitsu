"use client";

import { useCallback, useRef } from "react";

import type { EditorRefApi } from "~/_components/Editor/MainEditor";
import { MainEditor } from "~/_components/Editor/MainEditor";

export function AnswerOptions({
  cursorColor,
  length,
  id,
  choiceId,
  username,
}: {
  cursorColor: string;
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
    <div
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
        <MainEditor
          key={idx}
          cursorColor={cursorColor}
          // @ts-expect-error udah lah begini aja
          ref={(el: EditorRefApi) => setRef(idx, el)}
          roomName={`q-choice-opt_${id}-${choiceId}-${idx}`}
          username={username}
        >
          <p>Opsi jawaban ke {idx + 1}.</p>
        </MainEditor>
      ))}
    </div>
  );
}
