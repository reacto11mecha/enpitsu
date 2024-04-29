import { Modal, Pressable, Text, View } from "react-native";
import { router } from "expo-router";

export const GoHomeAlert = ({
  open,
  toggle,
}: {
  open: boolean;
  toggle: () => void;
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    statusBarTranslucent={true}
    visible={open}
    onRequestClose={toggle}
  >
    <View className="mt-7 flex h-screen items-center justify-center bg-black/80 p-3">
      <View className="w-full rounded rounded-lg border border-stone-300 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
        <View>
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            Kembali ke beranda?
          </Text>
          <Text className="mt-1 text-justify text-stone-900/70 dark:text-stone-50/70">
            Anda saat ini sedang mengerjakan soal. Jika anda kembali maka semua
            jawaban dan status kecurangan masih tetap tersimpan.
          </Text>
        </View>

        <View className="mt-3 flex flex-row justify-end gap-2">
          <Pressable
            className="flex h-[45] w-20 items-center justify-center rounded-lg border border-stone-300 dark:border-stone-700"
            onPress={toggle}
          >
            <Text className="text-center text-stone-900 dark:text-slate-50">
              Batal
            </Text>
          </Pressable>

          <Pressable
            className="flex h-[45] w-24 items-center justify-center rounded-lg bg-stone-900 disabled:bg-stone-600 dark:bg-stone-100 disabled:dark:bg-stone-400"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            <Text className="text-center text-slate-50 dark:text-stone-900">
              Kembali
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

export const DihonestyAlert = (_k: { open: boolean; close: () => void }) => (
  <></>
);

export const BadInternetAlert = ({
  open,
  close,
  backOnline,
}: {
  open: boolean;
  close: () => void;
  backOnline: boolean | null;
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    statusBarTranslucent={true}
    visible={open}
    onRequestClose={close}
  >
    <View className="mt-7 flex h-screen items-center justify-center bg-stone-800/50 p-3 dark:bg-stone-900/70">
      <View className="w-full rounded rounded-lg border border-stone-300 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
        <View>
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            {backOnline ? "Anda kembali terhubung." : "Koneksi anda terputus!"}
          </Text>
          <Text className="mt-1 text-justify text-stone-900/70 dark:text-stone-50/70">
            {backOnline ? (
              <>
                Sepertinya anda sudah kembali terhubung, jika memang sudah
                benar-benar aman dan sudah siap, maka klik tombol di bawah untuk
                melanjutkan ujian!
              </>
            ) : (
              <>
                Anda terputus ke jaringan internet, mohon untuk tersambung ke
                internet supaya bisa melanjutkan ujian.
              </>
            )}
          </Text>
        </View>

        <Pressable
          className="mt-3 flex h-[45] w-full items-center justify-center rounded-lg bg-stone-900 disabled:bg-stone-600 dark:bg-stone-100 disabled:dark:bg-stone-400"
          disabled={!backOnline}
          onPress={close}
        >
          <Text className="text-center text-slate-50 dark:text-stone-900">
            {backOnline ? "Saya sudah siap!" : "Koneksi anda masih terputus :("}
          </Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);
