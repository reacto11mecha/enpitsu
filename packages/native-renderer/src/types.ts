import type { Props } from "@/components/Test/utils";
import type { Theme } from "@/components/theme-provider";

type InitialData = Props["initialData"];

interface RNWebView {
  postMessage: (message: string) => void;
}

declare global {
  interface Window {
    isNativeApp: boolean;
    ReactNativeWebView: RNWebView;

    initFillData: (
      initialData: InitialData,
      data: Props["data"],
      studentToken: string,
      theme: Theme,
    ) => void;

    updateRendererTheme: (theme: Theme) => void;

    updateIsSubmitting: (submitting: boolean) => void;

    updateChoiceAnswerList: (
      updatedAnswer: InitialData["multipleChoices"][number],
    ) => void;
    updateEssayAnswerList: (
      updatedAnswer: InitialData["essays"][number],
    ) => void;
  }
}

export {};
