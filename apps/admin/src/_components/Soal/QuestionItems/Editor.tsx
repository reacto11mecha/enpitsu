"use client";

import katex from "katex";
// @ts-expect-error there's actually a type for this package, but dont know why this still yell for a missing type
import Delta from "quill-delta";
import ReactQuill from "react-quill";
import type { ReactQuillProps } from "react-quill";

import "katex/dist/katex.min.css";
import "react-quill/dist/quill.snow.css";

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
  return (
    <ReactQuill
      theme="snow"
      value={value}
      modules={quillModules}
      onChange={setValue}
    />
  );
}
