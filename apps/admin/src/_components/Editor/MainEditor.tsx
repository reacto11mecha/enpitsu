"use client";

import type { Value } from "platejs";
import * as React from "react";
import { BlockquoteElement } from "@enpitsu/ui/editor/blockquote-node";
import { Editor, EditorContainer } from "@enpitsu/ui/editor/editor";
import { FixedToolbar } from "@enpitsu/ui/editor/fixed-toolbar";
import {
  H1Element,
  H2Element,
  H3Element,
} from "@enpitsu/ui/editor/heading-node";
import { MarkToolbarButton } from "@enpitsu/ui/editor/mark-toolbar-button";
import { ToolbarButton } from "@enpitsu/ui/editor/toolbar";
import { TooltipProvider } from "@enpitsu/ui/tooltip";
import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { Plate, usePlateEditor } from "platejs/react";

const initialValue: Value = [
  {
    children: [{ text: "Title" }],
    type: "h3",
  },
  {
    children: [{ text: "This is a quote." }],
    type: "blockquote",
  },
  {
    children: [
      { text: "With some " },
      { bold: true, text: "bold" },
      { text: " text for emphasis!" },
    ],
    type: "p",
  },
];

export default function MainEditor() {
  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
    ],
    // value: () => {
    //     const savedValue = localStorage.getItem('installation-next-demo');
    //     return savedValue ? JSON.parse(savedValue) : initialValue;
    // },
  });

  return (
    <TooltipProvider>
      <Plate
        editor={editor}
        onChange={({ value }) => {
          console.log(JSON.stringify({ value }, null, 2));
          // localStorage.setItem('installation-next-demo', JSON.stringify(value));
        }}
      >
        <FixedToolbar className="flex justify-start gap-1 rounded-t-lg">
          <ToolbarButton onClick={() => editor.tf.h1?.toggle()}>
            H1
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.h2?.toggle()}>
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.h3?.toggle()}>
            H3
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>
            Quote
          </ToolbarButton>
          <MarkToolbarButton nodeType="bold" tooltip="Bold (Ctrl+B)">
            B
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="italic" tooltip="Italic (Ctrl+I)">
            I
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="underline" tooltip="Underline (Ctrl+U)">
            U
          </MarkToolbarButton>
          <div className="flex-1" />
          <ToolbarButton
            className="px-2"
            onClick={() => editor.tf.setValue(initialValue)}
          >
            Reset
          </ToolbarButton>
        </FixedToolbar>
        <EditorContainer>
          <Editor
            placeholder="Masukkan soal disini"
            className="[&>*]:whitespace-pre-wrap"
          />
        </EditorContainer>
      </Plate>
    </TooltipProvider>
  );
}
