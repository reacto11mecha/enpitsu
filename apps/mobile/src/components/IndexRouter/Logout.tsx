import { LogOut } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { AlertDialog, Button, XStack, YStack } from "tamagui";

import { studentAnswerAtom, studentTokenAtom } from "~/lib/atom";

export const Logout = () => {
  const [, setToken] = useAtom(studentTokenAtom);
  const [, setAnswers] = useAtom(studentAnswerAtom);

  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        <Button icon={<LogOut size={20} />} marginRight="20px" />
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
            <AlertDialog.Title>Yakin ingin logout?</AlertDialog.Title>
            <AlertDialog.Description>
              Anda bisa login kembali menggunakan token anda.
            </AlertDialog.Description>

            <XStack justifyContent="flex-end" space="$2">
              <AlertDialog.Cancel asChild>
                <Button>Batal</Button>
              </AlertDialog.Cancel>

              <Button
                onPress={() => {
                  setToken(RESET);
                  setAnswers(RESET);
                }}
              >
                Logout
              </Button>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};
