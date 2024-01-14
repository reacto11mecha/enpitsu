import React from "react";
import { BarCodeScanner, PermissionStatus } from "expo-barcode-scanner";
import { ScanLine } from "@tamagui/lucide-icons";
import { AlertDialog, Button, Text, XStack, YStack } from "tamagui";

import { formSchema } from "./schema";

const Scanner = ({ mutate }: { mutate: (slug: string) => void }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(
    null,
  );
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
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
    <YStack w="100%">
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{
          width: "100%",
          height: 250,
        }}
      />
      {error ? (
        <Text color="red" fontSize={12} textAlign="center">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
};

export const ScannerWrapper = ({
  sendMutate,
  isDisabled,
}: {
  sendMutate: (slug: string) => void;
  isDisabled: boolean;
}) => {
  const [open, setOpen] = React.useState(false);

  const mutate = React.useCallback(
    (slug: string) => {
      setOpen(false);

      sendMutate(slug);
    },
    [sendMutate],
  );

  return (
    <YStack w="100%">
      <AlertDialog open={open} onOpenChange={() => setOpen((prev) => !prev)}>
        <AlertDialog.Trigger asChild>
          <Button w="100%" icon={<ScanLine size={20} />} disabled={isDisabled}>
            Scan QR
          </Button>
        </AlertDialog.Trigger>

        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            scale={1}
            opacity={1}
            y={0}
          >
            <YStack space>
              <AlertDialog.Title>Scan Kode Soal</AlertDialog.Title>
              <AlertDialog.Description>
                Scan kode QR yang diberikan oleh pengawas ruangan.
              </AlertDialog.Description>

              <Scanner mutate={mutate} />

              <XStack justifyContent="flex-end">
                <AlertDialog.Cancel asChild>
                  <Button>Batal</Button>
                </AlertDialog.Cancel>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </YStack>
  );
};
