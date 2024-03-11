interface RNWebView {
  postMessage: (message: string) => void;
  injectedObjectJson: () => string;
}

declare global {
  interface Window {
    isNativeApp: boolean;
    ReactNativeWebView: RNWebView;
  }
}

export {};
