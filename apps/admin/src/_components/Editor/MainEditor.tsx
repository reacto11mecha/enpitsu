/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */

"use client";

import { useEffect, useImperativeHandle, useMemo } from "react";
import { YjsPlugin } from "@platejs/yjs/react";
import {
  Plate,
  useEditorRef,
  usePlateEditor,
  usePluginOption,
} from "platejs/react";

import { BasicNodesKit } from "~/components/editor/plugins/basic-nodes-kit";
import { Button } from "~/components/ui/button";
import { Editor, EditorContainer } from "~/components/ui/editor";
import { FixedToolbar } from "~/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "~/components/ui/mark-toolbar-button";
import { RemoteCursorOverlay } from "~/components/ui/remote-cursor-overlay";
import { ToolbarButton } from "~/components/ui/toolbar";
import { useMounted } from "~/hooks/use-mounted";

const INITIAL_VALUE = [
  {
    children: [{ text: "" }],
    type: "p",
  },
];

export interface EditorRefApi {
  isEmpty: () => boolean;
  insertText: (txt: string) => void;
}

export function MainEditor({
  username,
  roomName,
  ref,
}: {
  username: string;
  roomName: string;
  ref?: React.RefObject<EditorRefApi>;
}) {
  const mounted = useMounted();
  const cursorColor = useMemo(() => getRandomColor(), []);

  const editor = usePlateEditor(
    {
      plugins: [
        ...BasicNodesKit,
        YjsPlugin.configure({
          options: {
            cursors: {
              data: { color: cursorColor, name: username },
            },
            providers: [
              {
                options: {
                  name: roomName,
                  url: "ws://localhost:1234",
                },
                type: "hocuspocus",
              },
              {
                options: {
                  roomName: roomName,
                },
                type: "webrtc",
              },
            ],
          },
          render: {
            afterEditable: RemoteCursorOverlay,
          },
        }),
      ],
      skipInitialization: true,
    },
    [roomName],
  );

  useImperativeHandle(
    ref,
    () => ({
      isEmpty: () => editor.api.isEmpty(),
      insertText: (txt: string) => editor.transforms.insertText(txt),
    }),
    [editor],
  );

  useEffect(() => {
    if (!mounted) return;

    void editor.getApi(YjsPlugin).yjs.init({
      id: roomName,
      autoSelect: "end",
      value: INITIAL_VALUE,
    });

    return () => {
      editor.getApi(YjsPlugin).yjs.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, mounted]);

  return (
    <Plate editor={editor}>
      <CollaborativeEditor cursorColor={cursorColor} username={username} />
    </Plate>
  );
}

function CollaborativeEditor({
  cursorColor,
  username,
}: {
  cursorColor: string;
  username: string;
}) {
  const editor = useEditorRef();
  const isConnected = usePluginOption(YjsPlugin, "_isConnected");
  const isSynced = usePluginOption(YjsPlugin, "_isSynced");

  const toggleConnection = () => {
    if (editor.getOptions(YjsPlugin)._isConnected) {
      return editor.getApi(YjsPlugin).yjs.disconnect();
    }

    editor.getApi(YjsPlugin).yjs.connect();
  };

  return (
    <>
      <div className="bg-muted space-y-2 rounded-xl px-4 py-2 font-medium">
        <p>
          Nama anda akan tampil sebagai{" "}
          <span style={{ color: cursorColor }}>{username}</span>
        </p>

        <div className="flex flex-row items-center gap-2">
          <Button
            disabled={isConnected}
            size="sm"
            variant="outline"
            onClick={toggleConnection}
            className="disabled:bg-green-100 disabled:text-green-800 disabled:opacity-100 disabled:dark:text-green-500"
          >
            {isConnected ? "Terhubung" : "Hubungkan Kembali"}
          </Button>

          <span
            className={`rounded px-2 py-0.5 ${
              isSynced
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            Data sinkron: {isSynced ? "Ya" : "Tidak"}
          </span>
        </div>
      </div>

      <FixedToolbar className="mt-4 flex justify-start gap-1 rounded-t-lg">
        {/* @ts-expect-error harusnya ada, tapi ga kena inherit */}
        <ToolbarButton onClick={() => editor.tf.h1.toggle()}>H1</ToolbarButton>
        {/* @ts-expect-error harusnya ada, tapi ga kena inherit */}
        <ToolbarButton onClick={() => editor.tf.h2.toggle()}>H2</ToolbarButton>
        {/* @ts-expect-error harusnya ada, tapi ga kena inherit */}
        <ToolbarButton onClick={() => editor.tf.h3.toggle()}>H3</ToolbarButton>
        {/* @ts-expect-error harusnya ada, tapi ga kena inherit */}
        <ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>
          Quote
        </ToolbarButton>
        <MarkToolbarButton nodeType="bold" tooltip="Huruf tebal (Ctrl+B)">
          B
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="italic" tooltip="Cetak miring (Ctrl+I)">
          I
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="underline" tooltip="Garis bawah (Ctrl+U)">
          U
        </MarkToolbarButton>
      </FixedToolbar>

      <EditorContainer variant="default" className="bg-muted">
        <Editor
          className="pb-7"
          placeholder="Klik disini untuk mengetikkan pertanyaan"
        />
      </EditorContainer>
    </>
  );
}

const getRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
