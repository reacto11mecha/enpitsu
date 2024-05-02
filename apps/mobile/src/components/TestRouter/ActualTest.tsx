import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  // AppState,
  Pressable,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
// import { formSchema } from "./utils";

import type { WebViewMessageEvent } from "react-native-webview";
import { useAssets } from "expo-asset";
import { useKeepAwake } from "expo-keep-awake";
import { Link, router } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import { useNetInfo } from "@react-native-community/netinfo";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ArrowLeft } from "lucide-react-native";
import { useDebounceCallback } from "usehooks-ts";

import { api } from "~/lib/api";
import { studentAnswerAtom, studentTokenAtom } from "~/lib/atom";
import {
  BadInternetAlert,
  // DihonestyAlert,
  GoHomeAlert,
} from "./AllAlert";
import type {
  // TFormSchema,
  TPropsRealTest,
  TPropsWrapper,
  TSubmitAnswerParam,
  TSubmitCheatParam,
} from "./utils";

const RealActualTest = memo(function ActualTest({
  data,
  refetch,
  webviewAsset,
  initialData,
  isSubmitLoading,
  submitAnswer,
  currDishonestCount, // updateDishonestCount,
} // submitCheated,
: TPropsRealTest) {
  const webviewRef = useRef<WebView>(null!);

  usePreventScreenCapture();

  const [studentAnswers, setStudentAnswers] = useAtom(studentAnswerAtom);

  const studentToken = useAtomValue(studentTokenAtom);

  const [checkIn] = useState(
    initialData?.checkIn
      ? new Date(initialData.checkIn as unknown as string)
      : new Date(),
  );
  // Toggle this initial state value for prod and dev
  const canUpdateDishonesty = useRef(true);

  const [isEnded, setEnded] = useState(false);

  const [homeAlertShowed, setHomeShowed] = useState(false);

  const { isConnected } = useNetInfo();

  // const appState = React.useRef(AppState.currentState);

  const [badInternetAlert, setBadInternet] = useState(false);

  const closeBadInternet = useCallback(() => {
    if (isConnected) {
      canUpdateDishonesty.current = true;
      setBadInternet(false);
    }
  }, [isConnected]);

  useEffect(() => {
    webviewRef.current.injectJavaScript(
      `window.updateIsSubmitting(${JSON.stringify(isSubmitLoading)})`,
    );
  }, [isSubmitLoading]);

  // Track changes of user network status. User can turned on their
  // internet connection and safely continue their exam like normal.
  useEffect(() => {
    if (!isConnected && isConnected !== null) {
      canUpdateDishonesty.current = false;
      setBadInternet(true);
    }
  }, [isConnected]);

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

  const messageProcessor = useCallback(
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

        case "CLIENT:REFETCH_LIST": {
          refetch();
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
      <View className="flex h-screen w-screen flex-col items-center justify-center gap-8 p-3">
        <View className="flex flex-col items-center gap-3 text-center">
          <Text className="text-center font-[IBMPlex] text-3xl font-semibold tracking-tight text-red-600 first:mt-0 dark:text-red-500">
            Waktu Habis
          </Text>
          <Text className="text-center text-lg/8 dark:text-stone-100">
            Waktu ulangan sudah selesai, anda tidak bisa mengerjakan soal ini
            lagi.
          </Text>
        </View>

        <Text className="text-stone-900/80 dark:text-stone-50/80">
          Kode soal: {data.slug}
        </Text>

        <Pressable
          className="flex h-[45] w-24 items-center justify-center rounded-lg border border-none bg-stone-900 text-stone-900 dark:border-stone-700 dark:bg-transparent disabled:dark:bg-stone-400"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        >
          <ArrowLeft color="#EAEAEA" size={30} />
        </Pressable>
      </View>
    );

  return (
    <View className="h-screen">
      <GoHomeAlert
        open={homeAlertShowed}
        toggle={() => setHomeShowed((prev) => !prev)}
      />

      <BadInternetAlert
        open={badInternetAlert}
        close={closeBadInternet}
        backOnline={isConnected}
      />

      <WebView
        ref={webviewRef}
        source={webviewAsset}
        useWebView2={true}
        onMessage={messageProcessor}
        injectedJavaScriptBeforeContentLoaded={`window.isNativeApp = true;window['RNWebView'] = window.ReactNativeWebView;true`}
      />
    </View>
  );
});

function TestWrapper({
  data,
  refetch,
  initialData,
  webviewAsset,
}: TPropsWrapper) {
  useKeepAwake();

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
    onError(_error) {
      // toast.show("Operasi Gagal", {
      //   message: `Gagal menyimpan jawaban. Error: ${error.message}`,
      // });
    },
    retry: false,
  });

  const [dishonestyCount, setDishonestyCount] = useState(
    initialData?.dishonestCount ?? 0,
  );

  const isSubmitLoading = useMemo(
    () => submitAnswerMutation.isLoading,
    [submitAnswerMutation.isLoading],
  );

  const submitAnswer = useCallback(
    (params: TSubmitAnswerParam) => submitAnswerMutation.mutate(params),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const currDishonestCount = useMemo(() => dishonestyCount, [dishonestyCount]);
  const updateDishonestCount = useCallback(
    (count: React.SetStateAction<number>) => setDishonestyCount(count),
    [],
  );

  const submitCheated = useCallback(
    (params: TSubmitCheatParam) => blocklistMutation.mutate(params),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (submitAnswerMutation.isSuccess)
    return (
      <View className="flex h-screen w-screen flex-col items-center justify-center gap-8 p-3">
        <View className="flex flex-col items-center gap-3 text-center">
          <Text className="text-center font-[IBMPlex] text-3xl font-semibold tracking-tight text-green-600 first:mt-0 dark:text-green-500">
            Berhasil Submit
          </Text>
          <Text className="text-center text-lg/8 dark:text-stone-100">
            Jawaban berhasil terkirim, anda bisa menunjukan ini ke pengawas
            ruangan bahwa jawaban anda telah di submit dengan aman. Screenshot
            bukti ini untuk berjaga-berjaga.
          </Text>
        </View>

        <Text className="text-stone-900/80 dark:text-stone-50/80">
          Kode soal: {data.slug}
        </Text>

        <Pressable
          className="flex h-[45] w-24 items-center justify-center rounded-lg border border-none bg-stone-900 text-stone-900 dark:border-stone-700 dark:bg-transparent disabled:dark:bg-stone-400"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        >
          <ArrowLeft color="#EAEAEA" size={30} />
        </Pressable>
      </View>
    );

  if (dishonestyCount > 2)
    return (
      <View>
        <Link href="/" replace>
          Ke halaman depan
        </Link>
      </View>
    );

  return (
    <>
      {webviewAsset ? (
        <RealActualTest
          data={data}
          refetch={refetch}
          initialData={initialData}
          webviewAsset={webviewAsset}
          isSubmitLoading={isSubmitLoading}
          submitAnswer={submitAnswer}
          currDishonestCount={currDishonestCount}
          updateDishonestCount={updateDishonestCount}
          submitCheated={submitCheated}
        />
      ) : null}
    </>
  );
}

export const ActualTest = memo(
  TestWrapper,
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data),
);
