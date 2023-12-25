import { useEffect, useRef } from "react";

export interface Props {
  question: {
    id: number;
    slug: string;
    title: string;
    startedAt: Date;
    endedAt: Date;
    authorId: string;
    multipleChoices: {
      question: string;
      questionId: number;
      iqid: number;
      options: {
        order: number;
        answer: string;
      }[];
      correctAnswerOrder: number;
    }[];
    essays: {
      question: string;
      questionId: number;
      iqid: number;
      answer: string;
    }[];
  };
}

type Timer = ReturnType<typeof setTimeout>;
type SomeFunction = (...args: never) => void;

export function useDebounce<Func extends SomeFunction>(
  func: Func,
  delay = 850,
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

type TCleanedMultipleChoice = Omit<
  Props["question"]["multipleChoices"][number],
  "questionId"
>[];

export const findMultipleChoiceUpdate = (
  baseArray: Props["question"]["multipleChoices"],
  updatedArray: TCleanedMultipleChoice,
): TCleanedMultipleChoice[number] | undefined => {
  for (const baseObj of baseArray) {
    const updatedObj = updatedArray.find((obj) => obj.iqid === baseObj.iqid);

    if (updatedObj) {
      // Compare properties to determine if the object is updated
      if (
        baseObj.question !== updatedObj.question ||
        JSON.stringify(baseObj.options) !==
          JSON.stringify(updatedObj.options) ||
        baseObj.correctAnswerOrder !== updatedObj.correctAnswerOrder
      ) {
        return updatedObj;
      }
    }
  }

  return undefined; // No updated object found
};

type TCleanedEssay = Omit<Props["question"]["essays"][number], "questionId">[];

export const findEssayUpdate = (
  baseArray: Props["question"]["essays"],
  updatedArray: TCleanedEssay,
): TCleanedEssay[number] | undefined => {
  for (const baseObj of baseArray) {
    const updatedObj = updatedArray.find((obj) => obj.iqid === baseObj.iqid);

    if (updatedObj) {
      // Compare properties to determine if the object is updated
      if (
        baseObj.question !== updatedObj.question ||
        baseObj.answer !== updatedObj.answer
      ) {
        return updatedObj;
      }
    }
  }

  return undefined; // No updated object found
};
