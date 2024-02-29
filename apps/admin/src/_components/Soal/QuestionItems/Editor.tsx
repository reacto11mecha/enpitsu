"use client";

import { useRef } from "react";
import katex from "katex";
// @ts-expect-error there's actually a type for this package, but dont know why this still yell for a missing type
import Delta from "quill-delta";
import ReactQuill from "react-quill";
import type { ReactQuillProps } from "react-quill";

import "katex/dist/katex.min.css";
import "react-quill/dist/quill.snow.css";

const Quill = ReactQuill.Quill;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Embed = Quill.import("blots/block/embed");

class AudioBlot extends Embed {
  static blotName: string;
  static tagName: string;

  static create(url: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const node = super.create() as HTMLAudioElement;

    node.setAttribute("src", url);
    node.setAttribute("controls", "");

    node.style.width = "100%";

    return node;
  }

  static value(node: HTMLAudioElement) {
    return node.getAttribute("src");
  }
}
AudioBlot.blotName = "audio";
AudioBlot.tagName = "audio";

Quill.register(AudioBlot);

window.katex = katex;

const quillModules: ReactQuillProps["modules"] = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],

    [{ size: [] }],

    ["bold", "italic", "underline"],

    [
      { list: "ordered" },
      { list: "bullet" },

      { indent: "-1" },
      { indent: "+1" },
    ],

    ["image", "formula"],

    [{ align: [] }],

    ["clean"],
  ],

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
            }),
          );
        },
      ],
    ],
  },
};

export default function Editor({
  value,
  setValue,
}: {
  value: ReactQuill.Value | undefined;
  setValue: (val: string) => void;
}) {
  const quillRef = useRef<ReactQuill>(null!);

  return (
    <div className="flex w-full flex-col gap-2">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        modules={quillModules}
        onChange={setValue}
      />

      <button
        onClick={() => {
          if (quillRef.current) {
            quillRef.current
              .getEditor()
              .insertEmbed(
                quillRef.current.selection?.index ?? 0,
                "audio",
                "https://download.samplelib.com/mp3/sample-6s.mp3",
                "user",
              );
          }
        }}
      >
        ASD
      </button>
    </div>
  );
}
