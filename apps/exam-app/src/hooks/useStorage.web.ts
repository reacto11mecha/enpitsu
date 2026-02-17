import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  Answers,
  AuthState,
  StudentAnswer,
  ThemeState,
} from "./useStorage";

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
      storage: createJSONStorage(() => AsyncStorage),
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
    }),
    {
      name: "student-answer-persist",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
