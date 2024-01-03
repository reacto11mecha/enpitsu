import { atom } from "jotai";

export const studentTokenAtom = atom("");

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

export const studentAnswerAtom = atom<TStudentAnswer[]>([]);
