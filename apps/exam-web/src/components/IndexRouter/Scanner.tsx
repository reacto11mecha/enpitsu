import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@enpitsu/ui/alert-dialog";
import { Button } from "@enpitsu/ui/button";
import { ScanLine } from "lucide-react";
import QrScanner from "qr-scanner";
import slugify from "slugify";

import { formSchema } from "./schema";

const Scanner = ({ mutate }: { mutate: (slug: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      ({ data: slug }) => {
        if (slug || slug !== "") {
          const result = formSchema.safeParse({ slug });

          if (!result.success) {
            const error = JSON.parse(result.error.message) as {
              message: string;
            }[];

            setError(error[0]!.message);

            return;
          }

          setError(null);

          qrScanner.stop();

          mutate(
            slugify(slug, {
              trim: false,
              strict: true,
              remove: /[*+~.()'"!:@]/g,
            }).toUpperCase(),
          );
        }
      },
      {
        highlightCodeOutline: true,
        highlightScanRegion: true,
      },
    );

    void qrScanner.start();

    return () => {
      qrScanner.destroy();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AlertDialogTitle>Mulai Scan</AlertDialogTitle>
      <AlertDialogDescription>
        Izinkan web ini mengakses untuk mengakses kamera.
      </AlertDialogDescription>

      <video
        className={`h-72 w-full rounded-md border ${
          error ? "border-red-600" : ""
        }`}
        ref={videoRef}
      />

      {error ? (
        <p className="text-center text-sm text-red-600">{error}</p>
      ) : null}
    </>
  );
};

export const ScannerWrapper = ({
  sendMutate,
  isDisabled,
}: {
  sendMutate: (slug: string) => void;
  isDisabled: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const mutate = useCallback(
    (slug: string) => {
      setOpen(false);

      sendMutate(slug);
    },
    [sendMutate],
  );

  return (
    <AlertDialog open={open} onOpenChange={() => setOpen((prev) => !prev)}>
      <AlertDialogTrigger asChild>
        <Button
          className="mt-1 flex w-full flex-row gap-2 p-10 text-lg"
          variant="outline"
          disabled={isDisabled}
        >
          <ScanLine /> Pindai QR
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <Scanner mutate={mutate} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
