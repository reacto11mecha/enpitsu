"use client";

import { useEffect, useImperativeHandle } from "react";
import { YjsPlugin } from "@platejs/yjs/react";
import {
  Plate,
  useEditorRef,
  usePlateEditor,
  usePluginOption,
} from "platejs/react";

import { AlignKit } from "~/components/editor/plugins/align-kit";
import { BasicNodesKit } from "~/components/editor/plugins/basic-nodes-kit";
import { FixedToolbarKit } from "~/components/editor/plugins/fixed-toolbar-kit";
import { ListKit } from "~/components/editor/plugins/list-kit";
import { MediaKit } from "~/components/editor/plugins/media-kit";
import { TableKit } from "~/components/editor/plugins/table-kit";
import { Button } from "~/components/ui/button";
import { Editor, EditorContainer } from "~/components/ui/editor";
import { RemoteCursorOverlay } from "~/components/ui/remote-cursor-overlay";
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
  showName = false,
  cursorColor,
  children,
  ref,
}: {
  username: string;
  roomName: string;
  showName?: boolean;
  cursorColor: string;
  children?: React.ReactNode;
  ref?: React.RefObject<EditorRefApi>;
}) {
  const mounted = useMounted();

  const editor = usePlateEditor(
    {
      plugins: [
        ...FixedToolbarKit,
        ...BasicNodesKit,
        ...AlignKit,
        ...TableKit,
        ...ListKit,
        ...MediaKit,
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
      <CollaborativeEditor
        showName={showName}
        cursorColor={cursorColor}
        username={username}
      >
        {children}
      </CollaborativeEditor>
    </Plate>
  );
}

function CollaborativeEditor({
  cursorColor,
  username,
  showName,
  children,
}: {
  cursorColor: string;
  username: string;
  showName: boolean;
  children: React.ReactNode;
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
      <div
        className={`bg-muted space-y-2 px-4 font-medium ${showName ? "rounded-xl py-2" : "rounded-sm py-3.5"}`}
      >
        {showName ? (
          <p>
            Nama anda akan tampil sebagai{" "}
            <span style={{ color: cursorColor }} suppressHydrationWarning>
              {username}
            </span>
          </p>
        ) : null}

        <div className="flex flex-row items-center justify-between">
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

          <>{children}</>
        </div>
      </div>

      <EditorContainer variant="default">
        <Editor
          className="pb-7"
          placeholder="Klik disini untuk mengetikkan pertanyaan"
        />
      </EditorContainer>
    </>
  );
}
