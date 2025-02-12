"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@enpitsu/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@enpitsu/ui/tooltip";
import QuillCursors from "quill-cursors";
import Delta from "quill-delta";
import { useQuill } from "react-quilljs";
import { IndexeddbPersistence } from "y-indexeddb";
import { QuillBinding } from "y-quill";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import "katex";
import "katex/dist/katex.min.css";
import "quill/dist/quill.snow.css";

const usercolors = [
  "#30bced",
  "#6eeb83",
  "#ee6352",
  "#9ac2c9",
  "#8acb88",
  "#1be7ff",
];
const getColor = () =>
  usercolors[Math.floor(Math.random() * usercolors.length)];

export interface ICustomEvent {
  type: string;
  event: string;
  clientID: number;
}

interface UserAwareness {
  name: string;
  color: string;
  image: string;
}

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

export const Questions = ({
  questionId,
  title,
  userName,
  userImage,
}: {
  questionId: number;
  title: string;
  userName: string;
  userImage: string;
}) => {
  const [initialized, setInitialized] = useState(false);
  const [anotherJoinedUsers, setAnotherUsers] = useState<UserAwareness[]>([]);

  const yDoc = useMemo(() => new Y.Doc(), []);
  const yWebsocket = useMemo(
    () =>
      new WebsocketProvider(
        "ws://localhost:1234",
        `question-${questionId}`,
        yDoc,
      ),
    [],
  );
  const yIndexedDB = useMemo(
    () => new IndexeddbPersistence(`question-${questionId}`, yDoc),
    [],
  );

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
    if (quill && !initialized) {
      const yText = yDoc.getText("");
      const binding = new QuillBinding(yText, quill, yWebsocket.awareness);

      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill, initialized]);

  useEffect(() => {
    yWebsocket.awareness.setLocalStateField("user", {
      name: userName,
      color: getColor(),
      image: userImage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const evtCallback = () => {
      // @ts-expect-error udah biarin aja ini mah (famous last word)
      const copiedMap = new Map<number, { user: UserAwareness }>(
        yWebsocket.awareness.getStates(),
      );
      copiedMap.delete(yWebsocket.awareness.clientID);

      if (copiedMap.size === 0) {
        setAnotherUsers([]);

        return;
      }

      const myself = yWebsocket.awareness.getLocalState() as unknown as {
        user: UserAwareness;
      } | null;

      if (!myself) return;

      const newData = Array.from(copiedMap)
        .map(([_, d]) => d.user)
        .filter((user) => myself.user.image !== user.image);
      const removeDuplicate = Array.from(new Set(newData.map((nd) => nd.image)))
        .map((img) => newData.find((d) => d.image === img))
        .filter((d) => !!d) satisfies UserAwareness[];

      setAnotherUsers(removeDuplicate);
    };

    yWebsocket.awareness.on("change", evtCallback);

    return () => {
      yWebsocket.awareness.off("change", evtCallback);
    };
  }, [yWebsocket.awareness]);

  return (
    <div className="mt-5 flex flex-col gap-8 pb-16">
      <h1>Soal: {title}</h1>
      <div className="flex flex-col gap-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Pilihan Ganda
        </h3>

        <div className="w-full">
          <div ref={quillRef} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Esai
          </h3>
        </div>

        <div className="w-full md:fixed md:bottom-2 md:right-2 md:w-fit">
          {anotherJoinedUsers.length > 0 ? (
            <>
              <h3 className="mb-2.5 scroll-m-20 text-xl font-semibold tracking-tight md:hidden">
                Pengguna yang aktif
              </h3>
              <div className="mb-2 grid grid-flow-col grid-cols-10 gap-1.5 md:flex md:max-h-[45vh] md:flex-col md:items-center md:justify-center md:overflow-y-auto">
                <TooltipProvider>
                  {anotherJoinedUsers.map((user) => (
                    <Tooltip key={user.image}>
                      <TooltipTrigger>
                        <Avatar
                          className="border"
                          style={{ borderColor: user.color }}
                        >
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="uppercase">
                            {user.name ? user.name.slice(0, 2) : "N/A"}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
