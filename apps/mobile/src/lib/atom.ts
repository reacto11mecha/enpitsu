import { atomWithStorage } from "jotai/utils";

export const studentTokenAtom = atomWithStorage<string>("token", "");

export interface TStudentAnswer {
  slug: string;
  dishonestCount: number | undefined;
  checkIn: Date | undefined;
  multipleChoices: {
    iqid: number;
    choosedAnswer: number;
  }[];
  essays: {
    iqid: number;
    answer: string;
  }[];
}

export const studentAnswerAtom = atomWithStorage<TStudentAnswer[]>(
  "studentAnswer",
  [],
);
