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
import { studentAnswerAtom, studentTokenAtom } from "@/lib/atom";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { LogOut } from "lucide-react";

export const Logout = () => {
  const setToken = useSetAtom(studentTokenAtom);
  const setAnswers = useSetAtom(studentAnswerAtom);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <LogOut />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Yakin ingin logout?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda bisa login kembali menggunakan token anda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setToken(RESET);
              setAnswers(RESET);
            }}
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
