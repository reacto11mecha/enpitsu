"use client";

import katex from "katex";
import ReactQuill from "react-quill";
import type { ReactQuillProps } from "react-quill";

import "katex/dist/katex.min.css";
import "react-quill/dist/quill.snow.css";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
window.katex = katex;

const quillModules = {
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
} satisfies ReactQuillProps["modules"];

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
