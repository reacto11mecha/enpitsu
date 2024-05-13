import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { LogOut } from "lucide-react-native";

import { studentAnswerAtom, studentTokenAtom } from "~/lib/atom";

export const Logout = () => {
  const [open, setOpen] = useState(false);

  const setToken = useSetAtom(studentTokenAtom);
  const setAnswers = useSetAtom(studentAnswerAtom);

  return (
    <>
      <Pressable
        className="flex w-[10%] items-center justify-center rounded-lg bg-transparent dark:bg-stone-200"
        onPress={() => setOpen(true)}
      >
        <LogOut color="#0c0a09" size={19} />
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <View className="mt-7 flex h-screen items-center justify-center bg-black/80 p-3">
          <View className="w-full rounded rounded-lg border border-stone-300 bg-white p-6 dark:border-stone-900 dark:bg-stone-900">
            <View>
              <Text className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                Kembali ke beranda?
              </Text>
              <Text className="mt-1 text-justify text-stone-900/70 dark:text-stone-50/70">
                Anda bisa login kembali menggunakan token anda.
              </Text>
            </View>

            <View className="mt-3 flex flex-row justify-end gap-2">
              <Pressable
                className="flex h-[45] w-20 items-center justify-center rounded-lg border border-stone-300 dark:border-stone-700"
                onPress={() => setOpen(false)}
              >
                <Text className="text-center text-stone-900 dark:text-slate-50">
                  Batal
                </Text>
              </Pressable>

              <Pressable
                className="flex h-[45] w-24 items-center justify-center rounded-lg bg-stone-900 disabled:bg-stone-600 dark:bg-stone-100 disabled:dark:bg-stone-400"
                onPress={() => {
                  void setToken(RESET);
                  void setAnswers(RESET);
                }}
              >
                <Text className="text-center text-slate-50 dark:text-stone-900">
                  Logout
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
