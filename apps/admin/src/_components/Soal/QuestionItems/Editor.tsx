/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useEffect, useRef } from "react";

import type { EditorConfig } from "@editorjs/editorjs";
import EditorJS from "@editorjs/editorjs";



// @ts-expect-error no types
import CheckList from "@editorjs/checklist";

// @ts-expect-error no types
import Code from "@editorjs/code";

// @ts-expect-error no types
import Delimiter from "@editorjs/delimiter";

// @ts-expect-error no types
import Embed from "@editorjs/embed";

// @ts-expect-error no types
import Image from "@editorjs/image";

// @ts-expect-error no types
import InlineCode from "@editorjs/inline-code";

// @ts-expect-error no types
import Link from "@editorjs/link";

// @ts-expect-error no types
import List from "@editorjs/list";

// @ts-expect-error no types
import Quote from "@editorjs/quote";

// @ts-expect-error no types
import SimpleImage from "@editorjs/simple-image";

// @ts-expect-error no types
import Paragraph from "@editorjs/paragraph";

// @ts-expect-error no types
import Header from "@editorjs/header"

export const EDITOR_TOOLS = {
    code: Code,
    header: {
        class: Header,
        config: {
            placeholder: 'Enter a Header',
            levels: [2, 3, 4],
            defaultLevel: 2
        }
    },
    paragraph: Paragraph,
    checklist: CheckList,
    embed: Embed,
    image: Image,
    inlineCode: InlineCode,
    link: Link,
    list: List,
    quote: Quote,
    simpleImage: SimpleImage,
    delimiter: Delimiter
} satisfies EditorConfig['tools'];

export default function Editor({ onChange }: { onChange: (value: string) => void }) {
    const ref = useRef<EditorJS>();
    const holder = useRef<HTMLDivElement>(null!)

    //initialize editorjs
    useEffect(() => {
        if (!ref.current) {
            const editor = new EditorJS({
                holder: holder.current,
                tools: EDITOR_TOOLS,
                async onChange(api) {
                    const data = await api.saver.save();

                    onChange(JSON.stringify(data))
                },
                minHeight: 63
            });

            ref.current = editor;
        }

        return () => {
            if (ref.current?.destroy) {
                ref.current.destroy();
            }
        };
    }, []);


    return <div ref={holder} className="prose max-w-full border-b" />;
};

