import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { Camera, CameraView, PermissionStatus } from "expo-camera/next";

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
  sendMutate, // isDisabled,
}: {
  sendMutate: (slug: string) => void;
  isDisabled: boolean;
}) => {
  const [_open, setOpen] = useState(false);

  const _mutate = useCallback(
    (slug: string) => {
      setOpen(false);

      sendMutate(slug);
    },
    [sendMutate],
  );

  return <></>;
};
