import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AppSettings } from "@enpitsu/settings";

export type AdminResponse = Omit<AppSettings, "canLogin">;

export interface AuthState {
  isLoggedIn: boolean;
  token: null | string;
  npsn: null | number;
  serverUrl: null | string;
  instanceName: null | string;

  tokenSource: null | string;
  tokenFlags: null | string;
  minimalTokenLength: null | number;
  maximalTokenLength: null | number;

  logOut: () => void;
  logIn: (
    params: {
      token: string;
      npsn: number;
      serverUrl: string;
      instanceName: string;
    } & AdminResponse,
  ) => void;
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
  updateMultipleChoice: (slug: string, iqid: number, answer: number) => void;
  updateEssay: (slug: string, iqid: number, answer: string) => void;
  setDishonestCount: (slug: string, count: number) => void;
  removeAnswer: (slug: string) => void;
  clearAll: () => void;
}

export type ThemeType = "light" | "dark" | "system";

export interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isLoggedIn: false,
      token: null,
      npsn: null,
      serverUrl: null,
      instanceName: null,
      tokenSource: null,
      tokenFlags: null,
      minimalTokenLength: null,
      maximalTokenLength: null,

      logOut() {
        set((state) => ({
          ...state,
          isLoggedIn: false,
          token: null,
          npsn: null,
          serverUrl: null,
          instanceName: null,
          tokenSource: null,
          tokenFlags: null,
          minimalTokenLength: null,
          maximalTokenLength: null,
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

export const useThemeStorage = create(
  persist<ThemeState>(
    (set) => ({
      theme: "system",
      setTheme(mode) {
        set(() => ({ theme: mode }));
      },
    }),
    {
      name: "user-theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useStudentAnswerStore = create(
  persist<Answers>(
    (set) => ({
      answers: [],

      newAnswer(slug) {
        set((state) => {
          if (state.answers.find((a) => a.slug === slug)) return state;

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

      updateMultipleChoice(slug, iqid, answer) {
        set((state) => ({
          answers: state.answers.map((s) => {
            if (s.slug !== slug) return s;

            const existingChoice = s.multipleChoices.find(
              (c) => c.iqid === iqid,
            );
            let newChoices;

            if (existingChoice) {
              newChoices = s.multipleChoices.map((c) =>
                c.iqid === iqid ? { ...c, choosedAnswer: answer } : c,
              );
            } else {
              newChoices = [
                ...s.multipleChoices,
                { iqid, choosedAnswer: answer },
              ];
            }

            return { ...s, multipleChoices: newChoices };
          }),
        }));
      },

      updateEssay(slug, iqid, answer) {
        set((state) => ({
          answers: state.answers.map((s) => {
            if (s.slug !== slug) return s;

            const existingEssay = s.essays.find((e) => e.iqid === iqid);
            let newEssays;

            if (existingEssay) {
              newEssays = s.essays.map((e) =>
                e.iqid === iqid ? { ...e, answer } : e,
              );
            } else {
              newEssays = [...s.essays, { iqid, answer }];
            }

            return { ...s, essays: newEssays };
          }),
        }));
      },

      setDishonestCount(slug, count) {
        set((state) => ({
          answers: state.answers.map((s) =>
            s.slug === slug ? { ...s, dishonestCount: count } : s,
          ),
        }));
      },

      removeAnswer(slug) {
        set((state) => ({
          answers: state.answers.filter((s) => s.slug !== slug),
        }));
      },

      clearAll() {
        set(() => ({ answers: [] }));
      },
    }),
    {
      name: "student-answer-persist",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
