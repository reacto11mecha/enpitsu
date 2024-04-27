import type { Props } from "@/components/Test/utils";

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
    ) => void;

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
