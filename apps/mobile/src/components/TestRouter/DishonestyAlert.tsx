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

export const DishonestyAlert = ({
  open,
  closeAlert,
}: {
  open: boolean;
  closeAlert: () => void;
}) => (
  <AlertDialog open={open} onOpenChange={closeAlert}>
    <AlertDialogTrigger>Open</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Anda beralih tab!</AlertDialogTitle>
        <AlertDialogDescription>
          Anda terekam berpindah tab, mohon{" "}
          <b>tetap berada pada tab ulangan ini</b> atau anda terekam melakukan
          kecurangan. Selama masih ada peringatan ini,{" "}
          <b>mohon tutup semua tab dan apapun yang tidak diperlukan</b>, lalu
          kembali melanjutkan ujian.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction>Saya sudah siap!</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
