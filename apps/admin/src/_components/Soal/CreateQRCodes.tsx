"use client";

import { useEffect, useState } from "react";
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
} from "@enpitsu/ui/alert-dialog";
import { Button } from "@enpitsu/ui/button";
import JSzip from "jszip";
import { QrCode } from "lucide-react";
import QRCode from "qrcode";

const ImageQR = ({ slug }: { slug: string }) => {
  const [imgUrl, setURL] = useState("");

  useEffect(() => {
    void QRCode.toDataURL(slug).then(setURL);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imgUrl} alt={`Gambar QR Code untuk slug ${slug}`} />;
};

export const CreateQRCodes = ({
  selectedData,
}: {
  selectedData: { slug: string; title: string }[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger
        className="ml-2 w-fit cursor-pointer space-x-3"
        asChild
      >
        <Button variant="outline" onClick={() => setOpen(true)}>
          <QrCode className="mr-2 h-4 md:w-4" />
          Buat QR Code
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Buat QR</AlertDialogTitle>
          <AlertDialogDescription>
            Berikut ini adalah QR code yang sudah anda pilih pada tabel list
            soal.
          </AlertDialogDescription>
          <div className="mt-3 grid max-h-[60vh] grid-cols-1 gap-5 overflow-y-scroll md:grid-cols-2">
            {selectedData.map((data) => (
              <div
                key={data.slug}
                className="flex flex-col items-center gap-2 text-center"
              >
                <ImageQR slug={data.slug} />

                <div className="flex flex-col items-center text-center">
                  <p className="text-sm">{data.title}</p>
                  <pre className="text-xs">{data.slug}</pre>
                </div>
              </div>
            ))}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Tutup
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              const zip = new JSzip();

              zip.file(
                "CATATAN.txt",
                `Gambar QR yang di hasilkan akan mengikuti kode soal. Cek folder img untuk mengecek hasilnya.\n\nList file:\n${selectedData
                  .map(
                    (d) => `- Kode soal: ${d.slug}\n  Judul Soal: ${d.title}`,
                  )
                  .join("\n\n")}`,
              );

              const img = zip.folder("img");

              for (const data of selectedData) {
                const imgUrl = await QRCode.toDataURL(data.slug, {
                  width: 1000,
                });

                img?.file(
                  `${data.slug}.png`,
                  imgUrl.replace("data:image/png;base64,", ""),
                  { base64: true },
                );
              }

              void zip.generateAsync({ type: "blob" }).then(function (content) {
                const element = document.createElement("a");

                element.setAttribute("href", URL.createObjectURL(content));
                element.setAttribute("download", `soal-qr-${+Date.now()}.zip`);

                element.click();

                setOpen(false);
              });
            }}
          >
            Unduh
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
