import { useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Home, LayoutList } from "lucide-react";

import type { TFormSchema } from "./utils";

export const GoToHome = ({
  canUpdateDishonesty,
}: {
  canUpdateDishonesty: (canUpdate: boolean) => void;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="outline" onClick={() => canUpdateDishonesty(false)}>
        <Home size={18} />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Kembali ke beranda?</AlertDialogTitle>
        <AlertDialogDescription>
          Anda saat ini sedang mengerjakan soal. Jika anda kembali maka semua
          jawaban dan status kecurangan masih tetap tersimpan.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => canUpdateDishonesty(true)}>
          Batal
        </AlertDialogCancel>
        <AlertDialogAction>Kembali</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const DishonestyCountAlert = ({
  dishonestyCount,
}: {
  dishonestyCount: number;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="outline">{dishonestyCount}</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Jumlah kecurangan</AlertDialogTitle>
        <AlertDialogDescription>
          Anda saat ini melakukan {dishonestyCount} kali kecurangan, melakukan
          tiga (3) kali kecurangan maka anda akan dinyatakan melakukan
          kecurangan.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Tutup</AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const AnsweredQuestionsList = ({
  open,
  toggleDrawer,
  multipleChoices,
  essays,
}: {
  open: boolean;
  toggleDrawer: (open: boolean) => void;
  multipleChoices: TFormSchema["multipleChoices"];
  essays: TFormSchema["essays"];
}) => {
  const currentQuestion = useMemo(() => undefined, []);

  return (
    <Drawer open={open} onOpenChange={toggleDrawer}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <LayoutList size={18} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-3xl pb-5">
          <DrawerHeader>
            <DrawerTitle>Daftar Soal</DrawerTitle>
            <DrawerDescription>
              Berikut ini soal yang sudah maupun belum dijawab. Tekan nomor soal
              tertera di bawah ini untuk otomatis di arahkan ke nomor tersebut.
            </DrawerDescription>
          </DrawerHeader>

          <div className="mx-auto flex max-h-[40vh] flex-col gap-5 overflow-y-scroll pl-4 pr-4">
            {multipleChoices.length >= 1 ? (
              <div className="flex flex-col gap-3">
                <h5 className="scroll-m-20 text-lg font-semibold tracking-tight">
                  Pilihan Ganda
                </h5>

                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12">
                  {multipleChoices.map((choice, idx) => (
                    <Button
                      key={choice.iqid}
                      onClick={() => {
                        toggleDrawer(false);

                        setTimeout(() => {
                          const targetElement = document.getElementById(
                            `choice-${choice.iqid}`,
                          );

                          if (targetElement)
                            targetElement.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }, 1500);
                      }}
                      // className={`${
                      //   currentQuestion?.multipleChoices?.find(
                      //     (answered) => answered.iqid === choice.iqid,
                      //   )
                      //     ? "bg-green-700 dark:bg-green-800 dark:text-white"
                      //     : "bg-rose-700 dark:bg-rose-800 dark:text-white"
                      // }`}
                      className="bg-rose-700 dark:bg-rose-800 dark:text-white"
                    >
                      {idx + 1}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {essays.length >= 1 ? (
              <div className="flex flex-col gap-3">
                <h5 className="scroll-m-20 text-lg font-semibold tracking-tight">
                  Esai
                </h5>

                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12">
                  {essays.map((essay, idx) => (
                    <Button
                      key={essay.iqid}
                      onClick={() => {
                        toggleDrawer(false);

                        setTimeout(() => {
                          const targetElement = document.getElementById(
                            `essay-${essay.iqid}`,
                          );

                          if (targetElement)
                            targetElement.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }, 1500);
                      }}
                      // className={`${
                      //   // Find specific answer content, but the form will be empty (undefined) at
                      //   // initialization, so using empty string as fallback fixed this problem.
                      //   // (Weird but as long the problem solved, doesnt really matter)
                      //   currentQuestion?.essays?.find(
                      //     (answered) => answered.iqid === essay.iqid,
                      //   )?.answer ?? ""
                      //     ? "bg-green-700 dark:bg-green-800 dark:text-white"
                      //     : "bg-rose-700 dark:bg-rose-800 dark:text-white"
                      // }`}
                      className="bg-rose-700 dark:bg-rose-800 dark:text-white"
                    >
                      {idx + 1}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Tutup</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
