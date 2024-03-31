import AsyncStorage from "@react-native-async-storage/async-storage";
import { add, formatISO } from "date-fns";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export const atomWithAsyncStorage = <T>(key: string, initialValue: T) => {
  const storage = createJSONStorage<T>(() => AsyncStorage);

  const overrideStorage = {
    ...storage,

    // override getItem and setItem
    getItem: async () => {
      // call original getItem
      const value = await storage.getItem(key, initialValue);

      // @ts-expect-error don't know what to type here
      const valueKeys = Object.keys(value);

      // value is already a JSON object -- createJSONStorage handles that for us
      return valueKeys.length > 1 ? value : { ...value, ...initialValue };
    },

    // @ts-expect-error pls be silent typescript
    setItem: (_, value, expireInHours = 200) => {
      // add expireAt to newValue
      const expireAt = add(new Date(), { hours: expireInHours });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updatedValue = { ...value, expireAt: formatISO(expireAt) };

      // updatedValue is a JSON object -- createJSONStorage handles that for us
      // call original setItem with updatedValue
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return storage.setItem(key, updatedValue);
    },
  };

  return atomWithStorage(key, initialValue, overrideStorage);
};

export const studentTokenAtom = atomWithAsyncStorage<{ token: string }>(
  "token",
  { token: "" },
);

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

export interface TAnswers {
  answers: TStudentAnswer[];
}

export const studentAnswerAtom = atomWithAsyncStorage<TAnswers>(
  "studentAnswer",
  { answers: [] },
);
