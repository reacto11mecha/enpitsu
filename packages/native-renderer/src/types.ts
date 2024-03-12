import type { Props } from "@/components/Test/utils";

interface RNWebView {
  postMessage: (message: string) => void;
  injectedObjectJson: () => string;
}

declare global {
  interface Window {
    isNativeApp: boolean;
    ReactNativeWebView: RNWebView;

    initFillData: (
      initialData: Props["initialData"],
      data: Props["data"],
      studentToken: string,
    ) => void;

    updateIsSubmitting: (submitting: boolean) => void;
  }
}

export {};
