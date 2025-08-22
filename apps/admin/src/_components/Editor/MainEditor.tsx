"use client";

import * as React from "react";
import { BlockquoteElement } from "~/components/ui/editor/blockquote-node";
import { Editor, EditorContainer } from "~/components/ui/editor/editor";
import { FixedToolbar } from "~/components/ui/editor/fixed-toolbar";
import {
  H1Element,
  H2Element,
  H3Element,
} from "~/components/ui/editor/heading-node";
import { MarkToolbarButton } from "~/components/ui/editor/mark-toolbar-button";
import { ToolbarButton } from "~/components/ui/editor/toolbar";
import { TooltipProvider } from "~/components/ui/tooltip";
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

import { YjsPlugin } from '@platejs/yjs/react';
import { RemoteCursorOverlay } from '~/components/ui/editor/remote-cursor-overlay';
import { useMounted } from "./use-mounted";

const INITIAL_VALUE = [
  {
    children: [{ text: 'Masukkan soal disini' }],
    type: 'p',
  },
];

export default function MainEditor({ yjsDocumentName }: { yjsDocumentName: string; needMusic?: boolean; }) {
  const mounted = useMounted();

  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),

      YjsPlugin.configure({
        render: {
          afterEditable: RemoteCursorOverlay,
        },
        options: {
          // Configure local user cursor appearance
          cursors: {
            data: {
              name: 'User Name', // Replace with dynamic user name
              color: '#aabbcc', // Replace with dynamic user color
            },
          },
          // Configure providers. All providers share the same Y.Doc and Awareness instance.
          providers: [
            // Example: Hocuspocus provider
            {
              type: 'hocuspocus',
              options: {
                name: yjsDocumentName, // Unique identifier for the document
                url: 'ws://localhost:1234', // Your Hocuspocus server URL
              },
            },
            // Example: WebRTC provider (can be used alongside Hocuspocus)
            // {
            //   type: 'webrtc',
            //   options: {
            //     roomName: yjsDocumentName, // Must match the document identifier
            //   },
            // },
          ],
        },
      }),
    ],

    skipInitialization: true,
  }, [yjsDocumentName]);

  React.useEffect(() => {
    if (!mounted) return;

    void editor.getApi(YjsPlugin).yjs.init({
      id: yjsDocumentName,
      autoSelect: 'end',
      value: INITIAL_VALUE,
    });

    return () => {
      editor.getApi(YjsPlugin).yjs.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, mounted]);

  return (
    <div className="w-full px-5 pb-3 pt-1.5 border rounded-md">
      {mounted ?
        <TooltipProvider>
          <Plate
            editor={editor}
          >
            <FixedToolbar className="flex justify-start gap-3 rounded-t-lg">
              <ToolbarButton className="text-base" onClick={() => editor.tf.h1?.toggle()}>
                H1
              </ToolbarButton>
              <ToolbarButton className="text-base" onClick={() => editor.tf.h2?.toggle()}>
                H2
              </ToolbarButton>
              <ToolbarButton className="text-base" onClick={() => editor.tf.h3?.toggle()}>
                H3
              </ToolbarButton>
              <ToolbarButton className="text-base" onClick={() => editor.tf.blockquote.toggle()}>
                Quote
              </ToolbarButton>
              <MarkToolbarButton className="text-base" nodeType="bold" tooltip="Bold (Ctrl+B)">
                B
              </MarkToolbarButton>
              <MarkToolbarButton className="text-base" nodeType="italic" tooltip="Italic (Ctrl+I)">
                I
              </MarkToolbarButton>
              <MarkToolbarButton className="text-base" nodeType="underline" tooltip="Underline (Ctrl+U)">
                U
              </MarkToolbarButton>
            </FixedToolbar>
            <EditorContainer>
              <Editor
                placeholder="Masukkan soal disini"
                className="[&>*]:whitespace-pre-wrap min-h-16"
              />
            </EditorContainer>
          </Plate>
        </TooltipProvider> : null}
    </div>
  );
}
