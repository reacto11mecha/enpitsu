"use client";

import type { WebsocketProvider } from "y-websocket";
import type { Text as YText } from "yjs";
import { useEffect, useState } from "react";
import QuillCursors from "quill-cursors";
import Delta from "quill-delta";
import { useQuill } from "react-quilljs";
import { QuillBinding } from "y-quill";

const toolbar = [
  [{ header: "1" }, { header: "2" }, { font: ["", "lpmqisepmisbah"] }],

  [{ size: [] }],

  ["bold", "italic", "underline"],

  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],

  ["image", "formula"],

  [{ align: [] }],

  ["clean"],
];

const formats = [
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "list",
  "indent",
  "size",
  "header",
  "image",
  "audio",
];

export function Editor({
  awareness,
  yText,
}: {
  awareness: WebsocketProvider["awareness"];
  yText: YText;
}) {
  const [initialized, setInitialized] = useState(false);

  const { Quill, quill, quillRef } = useQuill({
    modules: {
      cursors: true,
      toolbar,
      clipboard: {
        matchers: [
          [
            Node.ELEMENT_NODE,
            // @ts-expect-error don't know what to type here
            function (_node, delta) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              return delta.compose(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                new Delta().retain(delta.length(), {
                  color: false,
                  background: false,
                  link: false,
                }),
              );
            },
          ],
        ],
      },
    },

    formats,
  });

  if (Quill && !quill) {
    Quill.register("modules/cursors", QuillCursors);

    const Block = Quill.import("blots/block");

    class AudioBlot extends Block {
      static blotName = "audio";
      static tagName = "audio";

      static create(url: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const node = super.create() as HTMLAudioElement;

        node.setAttribute("src", url);
        node.setAttribute("controls", "");
        node.setAttribute("controlsList", "nodownload");

        node.style.width = "100%";

        return node;
      }

      static value(node: HTMLAudioElement) {
        return node.getAttribute("src");
      }
    }

    Quill.register(AudioBlot);
  }

  useEffect(() => {
    if (quill && !initialized && yText && awareness) {
      console.log(yText);
      console.log(awareness);

      new QuillBinding(yText, quill, awareness);

      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill, initialized]);

  return (
    <div className="w-full">
      <div ref={quillRef} />
    </div>
  );
}
