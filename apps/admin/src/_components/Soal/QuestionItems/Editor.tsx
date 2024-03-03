"use client";

import { useRef } from "react";
import katex from "katex";
// @ts-expect-error there's actually a type for this package, but dont know why this still yell for a missing type
import Delta from "quill-delta";
import ReactQuill from "react-quill";
import type { ReactQuillProps } from "react-quill";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button";

import "katex/dist/katex.min.css";
import "react-quill/dist/quill.snow.css";

const Quill = ReactQuill.Quill;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Embed = Quill.import("blots/block/embed");

class AudioBlot extends Embed {
  static blotName: string;
  static tagName: string;

  static create(url: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const node = super.create() as HTMLAudioElement;

    node.setAttribute("src", url);
    node.setAttribute("controls", "");
    node.setAttribute("controlsList", "nodownload")

    node.style.width = "100%";

    return node;
  }

  static value(node: HTMLAudioElement) {
    return node.getAttribute("src");
  }
}
AudioBlot.blotName = "audio";
AudioBlot.tagName = "audio";

Quill.register(AudioBlot);

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

const formSchema = z.object({
  audio: z.instanceof(FileList, { message: "Dibutuhkan file audio (mp3, ogg, wav)" })
    .refine((files) => files.length > 0, `Dibutuhkan file audio (mp3, ogg, wav)`)
    .refine(
      (files) => files.length <= 1,
      `Hanya diperbolehkan upload 1 file audio saja!`,
    )
})


export default function Editor({
  value,
  setValue,
  needAudioInput
}: {
  value: ReactQuill.Value | undefined;
  setValue: (val: string) => void;
  needAudioInput?: boolean | undefined;
}) {
  const quillRef = useRef<ReactQuill>(null!);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const reader = new FileReader();

    reader.addEventListener('load', (e) => {
      if (quillRef.current) {
        quillRef.current
          .getEditor()
          .insertEmbed(
            quillRef.current.selection?.index ?? 0,
            "audio",
            e.target?.result,
            "user",
          );

        form.reset()
      }
    });

    const audioItem = values.audio.item(0)

    if (audioItem) reader.readAsDataURL(audioItem);
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        modules={quillModules}
        onChange={setValue}
      />

      {needAudioInput ? <div className="flex w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
            <FormField
              control={form.control}
              name="audio"
              render={() => (
                <FormItem>
                  <FormLabel>Audio</FormLabel>
                  <FormControl>
                    <div className="flex flex-row gap-5">
                      <Input type="file" {...form.register("audio")} />
                      <Button type="submit">Tambah Audio</Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Masukan audio yang ingin ditambahkan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div> : null}

    </div>
  );
}
