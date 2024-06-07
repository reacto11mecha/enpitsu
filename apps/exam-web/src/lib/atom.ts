import { atomWithStorage } from "jotai/utils";

export type TSystemServer = {
  npsn: number | null;
  serverUrl: string | null;
  institution: string | null;
};

export const systemServerAtom = atomWithStorage<TSystemServer>("systemServer", {
  npsn: null,
  serverUrl: null,
  institution: null,
});

export const studentTokenAtom = atomWithStorage("studentToken", "");

export type TStudentAnswer = {
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
};

export const studentAnswerAtom = atomWithStorage<TStudentAnswer[]>(
  "studentAnswer",
  [],
);
