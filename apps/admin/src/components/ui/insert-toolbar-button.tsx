"use client";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import type { PlateEditor } from "platejs/react";
import * as React from "react";
import {
  // CalendarIcon,
  // ChevronRightIcon,
  // Columns3Icon,
  FileCodeIcon,
  // FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  // ImageIcon,
  // Link2Icon,
  ListIcon,
  ListOrderedIcon,
  // MinusIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  // SquareIcon,
  TableIcon,
  // TableOfContentsIcon,
} from "lucide-react";
import { KEYS } from "platejs";
import { useEditorRef } from "platejs/react";

import {
  insertBlock,
  insertInlineElement,
} from "~/components/editor/transforms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ToolbarButton, ToolbarMenuGroup } from "./toolbar";

interface Group {
  group: string;
  items: Item[];
}

interface Item {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
}

const groups: Group[] = [
  {
    group: "Blok dasar",
    items: [
      {
        icon: <PilcrowIcon />,
        label: "Teks",
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: "Judul 1",
        value: "h1",
      },
      {
        icon: <Heading2Icon />,
        label: "Judul 2",
        value: "h2",
      },
      {
        icon: <Heading3Icon />,
        label: "Judul 3",
        value: "h3",
      },
      {
        icon: <TableIcon />,
        label: "Tabel",
        value: KEYS.table,
      },
      {
        icon: <FileCodeIcon />,
        label: "Kode",
        value: KEYS.codeBlock,
      },
      {
        icon: <QuoteIcon />,
        label: "Kutipan",
        value: KEYS.blockquote,
      },
      // {
      //   icon: <MinusIcon />,
      //   label: 'Divider',
      //   value: KEYS.hr,
      // },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "List",
    items: [
      {
        icon: <ListIcon />,
        label: "Daftar berpoin",
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: "Daftar bernomor",
        value: KEYS.ol,
      },
      // {
      //   icon: <SquareIcon />,
      //   label: 'To-do list',
      //   value: KEYS.listTodo,
      // },
      // {
      //   icon: <ChevronRightIcon />,
      //   label: 'Toggle list',
      //   value: KEYS.toggle,
      // },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  // {
  //   group: 'Media',
  //   items: [
  //     {
  //       icon: <ImageIcon />,
  //       label: 'Gambar',
  //       value: KEYS.img,
  //     },
  //     {
  //       icon: <FilmIcon />,
  //       label: 'Embed',
  //       value: KEYS.mediaEmbed,
  //     },
  //   ].map((item) => ({
  //     ...item,
  //     onSelect: (editor, value) => {
  //       insertBlock(editor, value);
  //     },
  //   })),
  // },
  {
    group: "Blok lanjutan",
    items: [
      // {
      //   icon: <TableOfContentsIcon />,
      //   label: 'Table of contents',
      //   value: KEYS.toc,
      // },
      // {
      //   icon: <Columns3Icon />,
      //   label: '3 columns',
      //   value: 'action_three_columns',
      // },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: "Persamaan Matematika",
        value: KEYS.equation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Sebaris",
    items: [
      // {
      //   icon: <Link2Icon />,
      //   label: 'Link',
      //   value: KEYS.link,
      // },
      // {
      //   focusEditor: true,
      //   icon: <CalendarIcon />,
      //   label: 'Date',
      //   value: KEYS.date,
      // },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: "Persamaan sebaris",
        value: KEYS.inlineEquation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Tambah" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        align="start"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
