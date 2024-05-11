import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Camera, CameraView, PermissionStatus } from "expo-camera/next";
import { ScanLine } from "lucide-react-native";

import { formSchema } from "./schema";

const _Scanner = ({ mutate }: { mutate: (slug: string) => void }) => {
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
    return <Text>Sedang meminta akses kamera...</Text>;
  }

  if (hasPermission === false) {
    return (
      <Text>
        Tidak ada akses ke kamera, mohon izinkan supaya fitur ini bisa
        digunakan.
      </Text>
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
          width: "100%",
          height: 250,
        }}
      />
      {error ? <Text>{error}</Text> : null}
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
    </>
  );
};
