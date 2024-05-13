import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Camera, CameraView, PermissionStatus } from "expo-camera/next";
import { RefreshCw, ScanLine } from "lucide-react-native";

import { formSchema } from "./schema";

const Scanner = ({ mutate }: { mutate: (slug: string) => void }) => {
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === PermissionStatus.GRANTED);
    };

    void getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (data || data !== "") {
      const result = await formSchema.safeParseAsync({ slug: data });

      if (!result.success) {
        const error = JSON.parse(result.error.message) as {
          message: string;
        }[];

        setError(error.at(0)!.message);
        console.error(error.at(0)!.message);

        return;
      }

      setError(null);
      setScanned(true);

      mutate(data);
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex h-full w-full items-center justify-center gap-5">
        <View className="animate-spin">
          <RefreshCw color="#15803D" size={40} />
        </View>
        <Text className="text-slate-900 dark:text-slate-100">
          Sedang mengakses kamera...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex h-full w-full items-center justify-center">
        <Text className="text-center text-red-600 dark:text-red-500">
          Tidak ada akses ke kamera, mohon izinkan supaya fitur ini bisa
          digunakan.
        </Text>
      </View>
    );
  }

  return (
    <>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={{
          flex: 1,
        }}
      />

      {error ? (
        <Text className="mt-2 text-center text-red-600 dark:text-red-500">
          {error}
        </Text>
      ) : null}
    </>
  );
};

export const ScannerWrapper = ({
  sendMutate,
  isDisabled,
}: {
  sendMutate: (slug: string) => void;
  isDisabled: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const mutate = useCallback(
    (slug: string) => {
      setOpen(false);

      sendMutate(slug);
    },
    [sendMutate],
  );

  return (
    <>
      <Pressable
        className="flex h-[65] w-full flex-row items-center justify-center gap-3 rounded-lg border border-none bg-stone-900 text-stone-900 dark:border-stone-700 dark:bg-transparent"
        disabled={isDisabled}
        onPress={() => setOpen(true)}
      >
        <ScanLine color={isDisabled ? "#CACACA" : "#EAEAEA"} size={30} />
        <Text
          className={`text-xl ${
            isDisabled ? "text-white/70" : "text-stone-100"
          } font-semibold`}
        >
          Pindai QR
        </Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <View className="mt-7 flex h-screen items-center justify-center bg-black/80 p-3">
          <View className="flex h-[62vh] w-full gap-5 rounded rounded-lg border border-stone-300 bg-white p-6 dark:border-stone-900 dark:bg-stone-900">
            <View>
              <Text className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                Mulai Pindai QR
              </Text>
              <Text className="mt-1 text-justify text-stone-900/70 dark:text-stone-50/70">
                Mohon izinkan aplikasi ini untuk mengakses kamera. Arahkan kode
                QR ke kamera dengan benar.
              </Text>
            </View>

            <View className="mt-3 h-[32vh]">
              {open ? <Scanner mutate={mutate} /> : null}
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
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
