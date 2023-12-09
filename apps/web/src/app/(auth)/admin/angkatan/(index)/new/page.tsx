import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardWithForm() {
  return (
    <div className="mt-5 flex w-full flex-col justify-center gap-8 px-5">
      <h2 className="scroll-m-20 text-center text-3xl font-semibold tracking-tight first:mt-0">
        Buat Angkatan Baru
      </h2>

      <Suspense
        fallback={
          <div className="flex w-full flex-col items-center">
            <Skeleton className="h-[25em] w-full md:w-[35em]" />
          </div>
        }
      >
        <p>TEST</p>
      </Suspense>
    </div>
  );
}
