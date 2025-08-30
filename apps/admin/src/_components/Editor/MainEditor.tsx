"use client";

import type { UnifiedProvider, YjsProviderConfig } from "@platejs/yjs";
import { useEffect, useImperativeHandle, useMemo } from "react";
import { YjsPlugin } from "@platejs/yjs/react";
import {
  Plate,
  useEditorRef,
  usePlateEditor,
  usePluginOption,
} from "platejs/react";
import { IndexeddbPersistence } from "y-indexeddb";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

import { AlignKit } from "~/components/editor/plugins/align-kit";
import { BasicNodesKit } from "~/components/editor/plugins/basic-nodes-kit";
import { ListKit } from "~/components/editor/plugins/list-kit";
import { MathKit } from "~/components/editor/plugins/math-kit";
import { MediaKit } from "~/components/editor/plugins/media-kit";
import { TableKit } from "~/components/editor/plugins/table-kit";
import { Button } from "~/components/ui/button";
import { Editor, EditorContainer } from "~/components/ui/editor";
import { FixedToolbar } from "~/components/ui/fixed-toolbar";
import { FixedToolbarButtons } from "~/components/ui/fixed-toolbar-buttons";
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

  const { ydoc, providers } = useMemo(() => {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);

    const hocuspocusProvider: YjsProviderConfig = {
      type: "hocuspocus",
      options: {
        name: roomName,
        url: "ws://localhost:1234",
      },
    };

    const indexedDBInstance = new IndexeddbPersistence(roomName, doc);
    const indexedDBProvider: UnifiedProvider = {
      type: "indexeddb",
      document: doc,
      awareness: awareness,
      isConnected: true,
      isSynced: false,
      connect: function () {
        this.isConnected = true;
        this.isSynced = true;
      },
      disconnect: function () {
        this.isConnected = false;
        this.isSynced = false;
      },
      destroy: function () {
        void indexedDBInstance.destroy();
        this.disconnect();
      },
    };

    return {
      ydoc: doc,
      providers: [hocuspocusProvider, indexedDBProvider],
    };
  }, [roomName]);

  const editor = usePlateEditor(
    {
      plugins: [
        ...BasicNodesKit,
        ...AlignKit,
        ...MathKit,
        ...TableKit,
        ...ListKit,
        ...MediaKit,
        YjsPlugin.configure({
          options: {
            ydoc,
            cursors: {
              data: { color: cursorColor, name: username },
            },
            providers,
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
    <div>
      <div className="scrollbar-hidden supports-backdrop-blur:bg-background/60 sticky top-2 left-0 z-50 backdrop-blur-sm">
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

          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row md:gap-0">
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

        <FixedToolbar className="relative top-auto left-auto z-auto mt-4 flex justify-start gap-1 rounded-t-lg">
          <FixedToolbarButtons />
        </FixedToolbar>
      </div>

      <EditorContainer variant="default">
        <Editor
          className="pb-7"
          placeholder="Klik disini untuk mengetikkan pertanyaan"
        />
      </EditorContainer>
    </div>
  );
}
