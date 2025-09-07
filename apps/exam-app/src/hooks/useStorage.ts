import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthState {
  isLoggedIn: boolean;
  token: null | string;
  npsn: null | number;
  serverUrl: null | string;
  instanceName: null | string;

  logOut: () => void;
  logIn: (params: {
    token: string;
    npsn: number;
    serverUrl: string;
    instanceName: string;
  }) => void;
  updateToken: (token: string) => void;
}

export interface StudentAnswer {
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

export interface Answers {
  answers: StudentAnswer[];
  newAnswer: (slug: string) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isLoggedIn: false,
      token: null,
      npsn: null,
      serverUrl: null,
      instanceName: null,

      logOut() {
        set((state) => ({
          ...state,
          isLoggedIn: false,
          token: null,
          npsn: null,
          serverUrl: null,
          instanceName: null,
        }));
      },

      logIn(params) {
        set((state) => ({
          ...state,
          isLoggedIn: true,
          ...params,
        }));
      },

      updateToken(token) {
        set((state) => ({ ...state, token }));
      },
    }),
    {
      name: "auth-persist",
      storage: createJSONStorage(() => ({
        setItem,
        getItem,
        removeItem: deleteItemAsync,
      })),
    },
  ),
);

export const useStudentAnswerStore = create(
  persist<Answers>(
    (set) => ({
      answers: [],

      newAnswer(slug) {
        set((state) => {
          const newItem = {
            slug,
            dishonestCount: 0,
            checkIn: new Date(),
            essays: [],
            multipleChoices: [],
          } satisfies StudentAnswer;

          return {
            ...state,
            answers: [...state.answers, newItem],
          };
        });
      },
    }),
    {
      name: "student-answer-persist",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
