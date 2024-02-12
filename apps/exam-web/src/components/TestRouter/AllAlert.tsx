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
