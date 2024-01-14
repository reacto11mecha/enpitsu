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

export const BadInternetAlert = ({
  open,
  backOnline,
  closeBadInternet,
}: {
  open: boolean;
  backOnline: boolean;
  closeBadInternet: () => void;
}) => (
  <AlertDialog open={open} onOpenChange={closeBadInternet}>
    <AlertDialogTrigger>Open</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {backOnline ? "Anda kembali terhubung." : "Koneksi anda terputus!"}
        </AlertDialogTitle>
        <AlertDialogDescription>
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
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction disabled={!backOnline}>
          {backOnline ? "Saya sudah siap!" : "Koneksi anda masih terputus :("}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
