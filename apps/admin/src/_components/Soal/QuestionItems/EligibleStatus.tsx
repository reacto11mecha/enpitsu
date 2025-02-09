import { memo } from "react";
import { Button } from "@enpitsu/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@enpitsu/ui/sheet";
import { Loader2 } from "lucide-react";

export const EligibleStatus = memo(function EligibleStatus() {
  return (
    <div className="w-full md:fixed md:bottom-2 md:right-2 md:w-fit">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full md:w-fit">
            <Loader2 className="h-10 w-10 animate-spin" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Status Kelayakan Pengerjaan Soal</SheetTitle>
            <SheetDescription>
              Soal dapat dikatakan layak untuk dikerjakan oleh peserta apabila
              terdapat soal pilihan ganda atau soal esai atau ada keduanya.
              Setiap soal wajib memiliki pertanyaan dan opsi jawaban. Pada
              bagian ini, anda dapat mengetahui kesalahan yang anda dapat
              perbaiki.
            </SheetDescription>

            <p className="mt-2">Status: LOADING</p>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
});
