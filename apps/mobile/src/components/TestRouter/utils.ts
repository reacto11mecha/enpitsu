import { useEffect, useRef } from "react";
import type { SetStateAction } from "react";
import type { RouterInputs, RouterOutputs } from "@enpitsu/api";
import { z } from "zod";

import type { TStudentAnswer } from "~/lib/atom";

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
        .min(5)
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
export type TSubmitAnswerParam = RouterInputs["exam"]["submitAnswer"];
export type TSubmitCheatParam = RouterInputs["exam"]["storeBlocklist"];

type TData = RouterOutputs["exam"]["queryQuestion"];

export interface TPropsWrapper {
  data: TData;
  initialData: TStudentAnswer[];
  refetch: () => void;
}
export interface TPropsRealTest extends TPropsWrapper {
  isSubmitLoading: boolean;
  submitAnswer: (params: TSubmitAnswerParam) => void;

  currDishonestCount: number;
  updateDishonestCount: (count: SetStateAction<number>) => void;

  submitCheated: (params: TSubmitCheatParam) => void;
}

type Timer = ReturnType<typeof setTimeout>;
type SomeFunction = (...args: never) => void;

export function useDebounce<Func extends SomeFunction>(
  func: Func,
  delay = 250,
) {
  const timer = useRef<Timer>();

  useEffect(() => {
    return () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
    };
  }, []);

  const debouncedFunction = ((...args) => {
    const newTimer = setTimeout(() => {
      func(...args);
    }, delay);
    clearTimeout(timer.current);
    timer.current = newTimer;
  }) as Func;

  return debouncedFunction;
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
