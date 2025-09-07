import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Answers, AuthState, StudentAnswer } from "./useStorage";

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
