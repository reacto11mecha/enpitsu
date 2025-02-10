"use client";

import type { WebrtcProvider } from "y-webrtc";
import type { Doc as YDoc } from "yjs";
import { useEffect, useRef, useState } from "react";
import { Button } from "@enpitsu/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import { Input } from "@enpitsu/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import QuillCursors from "quill-cursors";
import Delta from "quill-delta";
import { useForm } from "react-hook-form";
import { useQuill } from "react-quilljs";
import { QuillBinding } from "y-quill";
import { z } from "zod";

import "katex";
import "katex/dist/katex.min.css";
import "quill/dist/quill.snow.css";

const formSchema = z.object({
  audio: z
    .string()
    .url()
    .min(1, { message: "Link diperlukan jika ingin menambahkan audio" })
    .endsWith(".mp3", {
      message: "Ekstensi file harus memiliki akhiran .mp3!",
    }),
});

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

export default function Editor({
  value,
  setValue,
  needAudioInput,
  yProvider,
  yDoc,
  namedYText,
}: {
  value: string | undefined;
  setValue: (val: string) => void;
  needAudioInput?: boolean | undefined;
  yDoc: YDoc;
  yProvider: WebrtcProvider;
  namedYText: string;
}) {
  const [initialized, setInitialized] = useState(false);

  const { Quill, quill, quillRef } = useQuill({
    modules: { cursors: true, toolbar },

    formats,

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audio: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (quill) {
      const range = quill.getSelection();

      quill.insertEmbed(0, "audio", {
        src: values.audio,
      });
      quill.setSelection(range ? range.index + 1 : quill.getLength());

      form.reset();
    }
  }

  useEffect(() => {
    if (quill && !initialized) {
      quill.on("text-change", () => {
        setValue(quill.root.innerHTML);
      });

      const yText = yDoc.getText(namedYText);
      const binding = new QuillBinding(yText, quill, yProvider.awareness);

      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill, initialized]);

  useEffect(() => {
    if (quill) {
      //const incomingDeltaFromValue = new Delta({ html: value });
      //console.log(incomingDeltaFromValue)
      if (quill.root.innerHTML !== value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }
      //quill.setSelection(value.length, value.length);
    }
  }, [quill, value]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full">
        <div ref={quillRef} />
      </div>

      {needAudioInput ? (
        <div className="flex w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-8"
            >
              <FormField
                control={form.control}
                name="audio"
                render={() => (
                  <FormItem>
                    <FormLabel>Audio</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-5">
                        <Input
                          type="url"
                          placeholder="Masukan full link | https://example.com/audio.mp3"
                          {...form.register("audio")}
                        />
                        <Button type="submit">Tambah Audio</Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Masukan audio yang ingin ditambahkan, wajib memiliki
                      ekstensi mp3.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      ) : null}
    </div>
  );
}
