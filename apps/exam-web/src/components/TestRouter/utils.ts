import type { TStudentAnswer } from "@/lib/atom";
import type { RouterOutputs } from "@enpitsu/api";
import { z } from "zod";

export const formSchema = z.object({
  multipleChoices: z.array(
    z.object({
      iqid: z.number(),
      question: z.string(),
      options: z
        .array(
          z.object({
            order: z.number(),
            answer: z.string(),
          }),
        )
        .min(4)
        .max(5),
      choosedAnswer: z
        .number()
        .min(1, { message: "Pilih salah satu jawaban!" }),
    }),
  ),

  essays: z.array(
    z.object({
      iqid: z.number(),
      question: z.string(),
      answer: z.string().min(1, { message: "Jawaban harus di isi!" }),
    }),
  ),
});

export type TFormSchema = z.infer<typeof formSchema>;

type TData = RouterOutputs["exam"]["queryQuestion"];

export interface Props {
  data: TData;
  initialData: TStudentAnswer[];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array] as T[];

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // @ts-expect-error expect undefined stuff
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
}
