"use client";

import ReactQuill from "react-quill";

import "react-quill/dist/quill.snow.css";

export default function Editor({
  value,
  setValue,
}: {
  value: ReactQuill.Value | undefined;
  setValue: (val: string) => void;
}) {
  return <ReactQuill theme="snow" value={value} onChange={setValue} />;
}
