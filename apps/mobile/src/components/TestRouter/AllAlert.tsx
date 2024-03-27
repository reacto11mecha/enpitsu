import { router } from "expo-router";
import { AlertDialog, Button, Text, XStack, YStack } from "tamagui";

export const GoHomeAlert = ({
  open,
  toggle,
}: {
  open: boolean;
  toggle: () => void;
}) => (
  <AlertDialog open={open} onOpenChange={toggle}>
    <AlertDialog.Trigger />
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
          <AlertDialog.Title>Kembali ke beranda?</AlertDialog.Title>
          <AlertDialog.Description>
            Anda saat ini sedang mengerjakan soal. Jika anda kembali maka semua
            jawaban dan status kecurangan masih tetap tersimpan.
          </AlertDialog.Description>

          <XStack justifyContent="flex-end" space="$2">
            <AlertDialog.Cancel asChild>
              <Button variant="outlined">Batal</Button>
            </AlertDialog.Cancel>

            <Button themeInverse onPress={() => router.replace("/")}>
              Kembali
            </Button>
          </XStack>
        </YStack>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog>
);

export const DihonestyAlert = ({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) => (
  <AlertDialog open={open} onOpenChange={close}>
    <AlertDialog.Trigger />
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
          <AlertDialog.Title>Anda beralih aplikasi!</AlertDialog.Title>
          <AlertDialog.Description>
            Anda terekam berpindah aplikasi, mohon{" "}
            <Text fontWeight="bold">tetap berada pada aplikasi ini</Text> atau
            anda akan terekam melakukan kecurangan. Selama masih ada peringatan
            ini,{" "}
            <Text fontWeight="bold">
              mohon tutup semua aplikasi atau apapun yang tidak diperlukan
            </Text>
            , lalu kembali melanjutkan ujian.
          </AlertDialog.Description>

          <XStack justifyContent="flex-end" space="$2">
            <AlertDialog.Cancel asChild>
              <Button width="100$" themeInverse>
                Saya sudah siap!
              </Button>
            </AlertDialog.Cancel>
          </XStack>
        </YStack>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog>
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
  <AlertDialog open={open} onOpenChange={close}>
    <AlertDialog.Trigger />
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
          <AlertDialog.Title>
            {backOnline ? "Anda kembali terhubung." : "Koneksi anda terputus!"}
          </AlertDialog.Title>
          <AlertDialog.Description>
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
          </AlertDialog.Description>

          <XStack justifyContent="flex-end" space="$2">
            <AlertDialog.Cancel asChild>
              <Button
                disabled={!backOnline}
                themeInverse
                opacity={!backOnline ? 0.5 : 1}
              >
                {backOnline
                  ? "Saya sudah siap!"
                  : "Koneksi anda masih terputus :("}
              </Button>
            </AlertDialog.Cancel>
          </XStack>
        </YStack>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog>
);
