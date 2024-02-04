import AsyncStorage from "@react-native-async-storage/async-storage";
import { add, formatISO } from "date-fns";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const atomWithAsyncStorage = <T>(key: string, initialValue: T) => {
  const storage = createJSONStorage<T>(() => AsyncStorage);

  // preserve original getItem and setItem
  const { getItem, setItem } = storage;

  // override setItem, expire in 2 weeks
  storage.setItem = (_, value, expireInHours = 336) => {
    // add expireAt to newValue
    // const expireAt = add(new Date(), { hours: expireInHours });
    // const updatedValue = { ...value, expireAt: formatISO(expireAt) };

    const updatedValue = value;

    // updatedValue is a JSON object -- createJSONStorage handles that for us
    // call original setItem with updatedValue
    return setItem(key, updatedValue);
  };

  // override getItem
  storage.getItem = async () => {
    // call original getItem
    const value = await getItem(key, initialValue);

    // value is already a JSON object -- createJSONStorage handles that for us
    return value;
  };

  return atomWithStorage(key, initialValue, storage);
};

export const studentTokenAtom = atomWithAsyncStorage<string>("token", "");

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

export const studentAnswerAtom = atomWithAsyncStorage<TStudentAnswer[]>(
  "studentAnswer",
  [],
);
