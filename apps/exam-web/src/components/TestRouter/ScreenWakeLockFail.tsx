import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const ScreenWakeLockFail = ({
  open,
  closeWakeLock,
}: {
  open: boolean;
  closeWakeLock: () => void;
}) => (
  <AlertDialog open={open} onOpenChange={closeWakeLock}>
    <AlertDialogTrigger>Open</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Gagal Mengaktifkan Mode Wake Lock</AlertDialogTitle>
        <AlertDialogDescription>
          Wake lock adalah fitur yang bisa menjaga perangkat anda dari tertidur
          (<i>Screen timeout</i>). Mohon atur waktu tunggu layar pada pengaturan
          perangkat untuk menunggu lebih lama, jika sudah lanjutkan pengerjaan
          soal.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction>Saya sudah siap!</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
