import React from "react";
import {
  // AppState,
  // RefreshControl,
  SafeAreaView,
  // ScrollView,
  // View,
} from "react-native";
import { WebView } from "react-native-webview";
// import { formSchema } from "./utils";

import type { WebViewMessageEvent } from "react-native-webview";
import { useAssets } from "expo-asset";
import Constants from "expo-constants";
import { useKeepAwake } from "expo-keep-awake";
import { Link } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
// import { useNetInfo } from "@react-native-community/netinfo";
import { useToastController } from "@tamagui/toast";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button, H3, Text, YStack } from "tamagui";
import { useDebounceCallback } from "usehooks-ts";

import { api } from "~/lib/api";
import { studentAnswerAtom, studentTokenAtom } from "~/lib/atom";
import {
  // BadInternetAlert,
  // DihonestyAlert,
  // DishonestyCountAlert,
  GoHomeAlert,
} from "./AllAlert";
import type {
  // TFormSchema,
  TPropsRealTest,
  TPropsWrapper,
  TSubmitAnswerParam,
  TSubmitCheatParam,
} from "./utils";

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(":")[0];

const RealActualTest = React.memo(function ActualTest({
  data,
  // refetch,
  initialData,
  isSubmitLoading,
  submitAnswer,
  currDishonestCount, // updateDishonestCount,
} // submitCheated,
: TPropsRealTest) {
  const webviewRef = React.useRef<WebView>(null!);

  usePreventScreenCapture();

  const [mainRenderer] = useAssets([
    require("@enpitsu/native-renderer/dist/index.html"),
  ]);

  const [studentAnswers, setStudentAnswers] = useAtom(studentAnswerAtom);

  const studentToken = useAtomValue(studentTokenAtom);

  const [checkIn] = React.useState(
    initialData?.checkIn
      ? new Date(initialData.checkIn as unknown as string)
      : new Date(),
  );
  const [isEnded, setEnded] = React.useState(false);

  const [homeAlertShowed, setHomeShowed] = React.useState(false);

  // const { isConnected } = useNetInfo();

  // const appState = React.useRef(AppState.currentState);

  // Toggle this initial state value for prod and dev
  const canUpdateDishonesty = React.useRef(true);

  // const [dishonestyWarning, setDishonestyWarning] = React.useState(false);
  // const [badInternetAlert, setBadInternet] = React.useState(false);

  // const closeDishonestyAlert = React.useCallback(() => {
  //   canUpdateDishonesty.current = true;
  //   setDishonestyWarning(false);
  // }, []);
  // const closeBadInternet = React.useCallback(() => {
  //   if (isConnected) {
  //     canUpdateDishonesty.current = true;
  //     setBadInternet(false);
  //   }
  // }, [isConnected]);

  // Increment dishonesty count up to 3 app changes.
  // The first two will ask kindly to not to cheat on their exam.
  // React.useEffect(() => {
  //   const subscription = AppState.addEventListener("change", (nextAppState) => {
  //     if (
  //       appState.current.match(/inactive|background/) &&
  //       nextAppState === "active" &&
  //       canUpdateDishonesty.current
  //     )
  //       updateDishonestCount((prev) => {
  //         const newValue = ++prev;

  //         if (newValue > 2) {
  //           canUpdateDishonesty.current = false;
  //         } else if (newValue < 3) {
  //           canUpdateDishonesty.current = false;
  //           setDishonestyWarning(true);
  //         }

  //         if (newValue > 0)
  //           void setStudentAnswers(async (prev) => {
  //             const original = await prev;
  //             const currAnswers = original.answers;

  //             return {
  //               answers: currAnswers.map((answer) =>
  //                 answer.slug === data.slug
  //                   ? { ...answer, dishonestCount: newValue }
  //                   : answer,
  //               ),
  //             };
  //           });

  //         if (newValue > 2)
  //           submitCheated({ questionId: data.id, time: new Date() });

  //         return newValue;
  //       });

  //     appState.current = nextAppState;
  //   });

  //   return () => {
  //     subscription.remove();
  //   };

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Track changes of user network status. User can turned on their
  // internet connection and safely continue their exam like normal.
  // React.useEffect(() => {
  //   if (!isConnected && isConnected !== null) {
  //     canUpdateDishonesty.current = false;
  //     setBadInternet(true);
  //   }
  // }, [isConnected]);

  React.useEffect(() => {
    webviewRef.current.injectJavaScript(
      `window.updateIsSubmitting(${JSON.stringify(isSubmitLoading)})`,
    );
  }, [isSubmitLoading]);

  const multipleChoiceDebounced = useDebounceCallback(
    (updatedData: { iqid: number; choosedAnswer: number }) => {
      void setStudentAnswers(async (prev) => {
        const original = await prev;
        const currAnswers = original.answers;

        return {
          answers: currAnswers.map((answer) =>
            answer.slug === data.slug
              ? {
                  ...answer,
                  multipleChoices: !answer.multipleChoices.find(
                    (choice) => choice.iqid === updatedData.iqid,
                  )
                    ? [...answer.multipleChoices, updatedData]
                    : answer.multipleChoices.map((choice) =>
                        choice.iqid === updatedData.iqid ? updatedData : choice,
                      ),
                }
              : answer,
          ),
        };
      });

      webviewRef.current.injectJavaScript(
        `window.updateChoiceAnswerList(${JSON.stringify(updatedData)})`,
      );
    },
    250,
  );

  const essayDebounced = useDebounceCallback(
    (updatedData: { iqid: number; answer: string }) => {
      void setStudentAnswers(async (prev) => {
        const original = await prev;
        const currAnswers = original.answers;

        return {
          answers: currAnswers.map((answer) =>
            answer.slug === data.slug
              ? {
                  ...answer,
                  essays: !answer.essays.find(
                    (choice) => choice.iqid === updatedData.iqid,
                  )
                    ? [...answer.essays, updatedData]
                    : answer.essays.map((essay) =>
                        essay.iqid === updatedData.iqid ? updatedData : essay,
                      ),
                }
              : answer,
          ),
        };
      });

      webviewRef.current.injectJavaScript(
        `window.updateEssayAnswerList(${JSON.stringify(updatedData)})`,
      );
    },
    250,
  );

  const messageProcessor = React.useCallback(
    (e: WebViewMessageEvent) => {
      const processed = JSON.parse(e.nativeEvent.data) as {
        key: string;
        value?: never;
      };

      console.log(processed);

      switch (processed.key) {
        case "CLIENT:INIT": {
          const latestAnswer = studentAnswers.answers.find(
            (answer) => answer.slug === data.slug,
          );

          webviewRef.current.injectJavaScript(
            `window.initFillData(
            ${JSON.stringify({
              dishonestCount: currDishonestCount,
              essays: latestAnswer?.essays ?? [],
              multipleChoices: latestAnswer?.multipleChoices ?? [],
            })},
            ${JSON.stringify(data)}, 
            ${JSON.stringify(studentToken.token)}
          )`,
          );

          break;
        }

        case "CLIENT:UPDATE_CHOICE": {
          const value = processed.value as unknown as Parameters<
            typeof multipleChoiceDebounced
          >["0"];

          if (value) multipleChoiceDebounced(value);

          break;
        }

        case "CLIENT:UPDATE_ESSAY": {
          const value = processed.value as unknown as Parameters<
            typeof essayDebounced
          >["0"];

          if (value) essayDebounced(value);

          break;
        }

        case "CLIENT:TIMES_UP": {
          setEnded(true);

          break;
        }

        case "CLIENT:SUBMIT": {
          const value = processed.value as unknown as Omit<
            Omit<Parameters<typeof submitAnswer>["0"], "checkIn">,
            "submittedAt"
          >;

          if (value) {
            canUpdateDishonesty.current = false;

            submitAnswer({ ...value, checkIn, submittedAt: new Date() });
          }

          break;
        }

        case "CLIENT:TRIGGER_HOME": {
          setHomeShowed(true);

          break;
        }

        default:
          break;
      }
    },
    [
      checkIn,
      currDishonestCount,
      data,
      essayDebounced,
      multipleChoiceDebounced,
      studentAnswers.answers,
      studentToken.token,
      submitAnswer,
    ],
  );

  if (isEnded)
    return (
      <SafeAreaView>
        <YStack
          h="100%"
          display="flex"
          jc="center"
          ai="center"
          gap={20}
          px={20}
        >
          <H3>Waktu Habis</H3>
          <Text textAlign="center">
            Waktu ulangan sudah selesai, anda tidak bisa mengerjakan soal ini
            lagi.
          </Text>

          <Link href="/" replace asChild>
            <Button variant="outlined">Ke halaman depan</Button>
          </Link>
        </YStack>
      </SafeAreaView>
    );

  return (
    <SafeAreaView>
      <GoHomeAlert open={homeAlertShowed} toggle={() => setHomeShowed(false)} />

      <YStack h="100%" display="flex" pt={35}>
        {__DEV__ ? (
          <WebView
            ref={webviewRef}
            style={{ height: "auto", width: "100%" }}
            source={{ uri: `http://${localhost}:5173` }}
            useWebView2={true}
            onMessage={messageProcessor}
            injectedJavaScriptBeforeContentLoaded={`window.isNativeApp = true;window['RNWebView'] = window.ReactNativeWebView;true`}
          />
        ) : (
          <>
            {mainRenderer ? (
              <WebView
                ref={webviewRef}
                style={{ height: "auto", width: "100%" }}
                source={{ uri: mainRenderer.at(0)!.uri }}
                useWebView2={true}
                onMessage={messageProcessor}
                injectedJavaScriptBeforeContentLoaded={`window.isNativeApp = true;window['RNWebView'] = window.ReactNativeWebView;true`}
              />
            ) : null}
          </>
        )}
      </YStack>
    </SafeAreaView>
  );
});

function TestWrapper({ data, refetch, initialData }: TPropsWrapper) {
  useKeepAwake();

  const toast = useToastController();

  const setStudentAnswers = useSetAtom(studentAnswerAtom);

  const blocklistMutation = api.exam.storeBlocklist.useMutation({
    onSuccess() {
      void setStudentAnswers(async (prev) => {
        const original = await prev;
        const currAnswers = original.answers;

        return {
          answers: currAnswers.filter((answer) => answer.slug !== data.slug),
        };
      });
    },
    onError(error) {
      toast.show("Operasi Gagal", {
        message: `Gagal menyimpan status kecurangan. Error: ${error.message}`,
      });
    },
    retry: false,
  });

  const submitAnswerMutation = api.exam.submitAnswer.useMutation({
    onSuccess() {
      void setStudentAnswers(async (prev) => {
        const original = await prev;
        const currAnswers = original.answers;

        return {
          answers: currAnswers.filter((answer) => answer.slug !== data.slug),
        };
      });
    },
    onError(error) {
      toast.show("Operasi Gagal", {
        message: `Gagal menyimpan jawaban. Error: ${error.message}`,
      });
    },
    retry: false,
  });

  const [dishonestyCount, setDishonestyCount] = React.useState(
    initialData?.dishonestCount ?? 0,
  );

  const isSubmitLoading = React.useMemo(
    () => submitAnswerMutation.isLoading,
    [submitAnswerMutation.isLoading],
  );

  const submitAnswer = React.useCallback(
    (params: TSubmitAnswerParam) => submitAnswerMutation.mutate(params),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const currDishonestCount = React.useMemo(
    () => dishonestyCount,
    [dishonestyCount],
  );
  const updateDishonestCount = React.useCallback(
    (count: React.SetStateAction<number>) => setDishonestyCount(count),
    [],
  );

  const submitCheated = React.useCallback(
    (params: TSubmitCheatParam) => blocklistMutation.mutate(params),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (submitAnswerMutation.isSuccess)
    return (
      <SafeAreaView>
        <YStack
          h="100%"
          display="flex"
          jc="center"
          ai="center"
          gap={20}
          px={20}
        >
          <H3>Berhasil Submit</H3>
          <Text textAlign="center">
            Jawaban berhasil terkirim, anda bisa menunjukan ini ke pengawas
            ruangan bahwa jawaban anda sudah di submit dengan aman. Screenshot
            bukti ini untuk berjaga-jaga.
          </Text>

          <Text>Kode Soal: {data.slug}</Text>

          <Link href="/" replace asChild>
            <Button variant="outlined">Ke halaman depan</Button>
          </Link>
        </YStack>
      </SafeAreaView>
    );

  if (dishonestyCount > 2)
    return (
      <SafeAreaView>
        <YStack
          h="100%"
          display="flex"
          jc="center"
          ai="center"
          gap={20}
          px={20}
        >
          <H3>Anda Melakukan Kecurangan</H3>
          <Text textAlign="center">
            Anda sudah tiga kali beralih dari aplikasi ini,{" "}
            {!blocklistMutation.isLoading && blocklistMutation.isSuccess ? (
              <>
                kami berhasil menyimpan status anda sudah melakukan kecurangan.
                Anda akan terlihat oleh panitia sudah melakukan kecurangan, lain
                kali jangan di ulangi lagi.
              </>
            ) : (
              <>
                {blocklistMutation.isError ? (
                  <>
                    kami gagal menyimpan status kecurangan anda, anda bisa
                    logout untuk me-reset status kecurangan pada browser
                    perangkat anda dan login kembali.
                  </>
                ) : (
                  <>kami sedang menyimpan status kecurangan anda...</>
                )}
              </>
            )}
          </Text>

          <Text>Kode Soal: {data.slug}</Text>

          <Link href="/" replace asChild>
            <Button variant="outlined">Ke halaman depan</Button>
          </Link>
        </YStack>
      </SafeAreaView>
    );

  return (
    <RealActualTest
      data={data}
      refetch={refetch}
      initialData={initialData}
      isSubmitLoading={isSubmitLoading}
      submitAnswer={submitAnswer}
      currDishonestCount={currDishonestCount}
      updateDishonestCount={updateDishonestCount}
      submitCheated={submitCheated}
    />
  );
}

export const ActualTest = React.memo(
  TestWrapper,
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data),
);
