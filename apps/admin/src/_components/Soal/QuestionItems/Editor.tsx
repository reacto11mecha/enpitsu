"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import katex from "katex";
// @ts-expect-error there's actually a type for this package, but dont know why this still yell for a missing type
import Delta from "quill-delta";
import { useForm } from "react-hook-form";
import ReactQuill from "react-quill";
import type { ReactQuillProps } from "react-quill";
import { z } from "zod";

import "katex/dist/katex.min.css";
import "react-quill/dist/quill.snow.css";

const Quill = ReactQuill.Quill;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Embed = Quill.import("blots/block/embed");

class AudioBlot extends Embed {
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Font = Quill.import("formats/font");

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
Font.whitelist = ["lpmqisepmisbah"];

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
Quill.register(Font, true);

window.katex = katex;

const quillModules: ReactQuillProps["modules"] = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: ["", "lpmqisepmisbah"] }],

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
  audio: z
    .string()
    .url()
    .min(1, { message: "Link diperlukan jika ingin menambahkan audio" })
    .endsWith(".mp3", {
      message: "Ekstensi file harus memiliki akhiran .mp3!",
    }),
});

export default function Editor({
  value,
  setValue,
  needAudioInput,
}: {
  value: ReactQuill.Value | undefined;
  setValue: (val: string) => void;
  needAudioInput?: boolean | undefined;
}) {
  const quillRef = useRef<ReactQuill>(null!);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audio: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (quillRef.current) {
      quillRef.current
        .getEditor()
        .insertEmbed(
          quillRef.current.selection?.index ?? 0,
          "audio",
          values.audio,
          "user",
        );

      form.reset();
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        modules={quillModules}
        onChange={setValue}
      />

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
