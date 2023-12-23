"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ClipboardCheck, Copy, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn } from "react-hook-form";

interface Props {
  index: number;
  title: string;
  currentField: UseFieldArrayReturn<
    {
      multipleChoice: {
        options: {
          order: number;
          answer: string;
        }[];
        question: string;
        correctAnswer: number;
      }[];
      essay: {
        question: string;
        answer: string;
      }[];
    },
    "multipleChoice",
    "id"
  >;
}

export const MultipleChoice = ({ index, title, currentField }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Soal Nomor {index + 1}</CardTitle>
        <CardDescription className="text-muted-foreground">
          Soal: {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <Separator />

      <CardFooter className="flex flex-row p-5">
        <div className="flex w-full flex-row justify-between">
          <Popover>
            <PopoverTrigger className="flex flex-row items-center gap-2 text-sky-600 dark:text-sky-500">
              <ClipboardCheck />
              Kunci jawaban
            </PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
          </Popover>

          <div className="flex flex-row gap-2">
            <Button variant="ghost">
              <span className="sr-only">Duplikat pertanyaan</span>
              <Copy />
            </Button>
            <Button variant="ghost" onClick={() => currentField.remove(index)}>
              <span className="sr-only">Hapus pertanyaan</span>
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
