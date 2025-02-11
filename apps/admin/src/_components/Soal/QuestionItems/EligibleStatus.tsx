import type { RouterOutputs } from "@enpitsu/api";
import type { WebrtcProvider } from "y-webrtc";
import { memo, useEffect, useMemo, useState } from "react";
import { cn } from "@enpitsu/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@enpitsu/ui/avatar";
import { Button } from "@enpitsu/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@enpitsu/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@enpitsu/ui/tooltip";
import {
  LaptopMinimalCheck,
  Loader2,
  LoaderPinwheel,
  OctagonX,
} from "lucide-react";

interface Props {
  isPending: boolean;
  isError: boolean;
  data: RouterOutputs["question"]["getEligibleStatusFromQuestion"] | undefined;
  yProvider: WebrtcProvider;
}

interface UserAwareness {
  name: string;
  color: string;
  image: string;
}

export const EligibleStatus = memo(function EligibleStatus({
  isPending,
  isError,
  data,
  yProvider,
}: Props) {
  const [anotherJoinedUsers, setAnotherUsers] = useState<UserAwareness[]>([]);
  const [sheetOpened, setOpened] = useState(false);

  const currentStatus = useMemo(() => {
    if (isPending)
      return {
        readable: "Sedang mengambil data status ke server...",
        showReason: false,
      };
    if (isError)
      return {
        readable: "Gagal mengambil data status ke server.",
        showReason: false,
      };

    if (!data)
      return {
        readable: "Status data kosong, mohon menunggu...",
        showReason: false,
      };

    switch (data.eligible) {
      case "ELIGIBLE":
        return {
          readable: "Status aman, peserta dapat mengerjakan soal ini.",
          showReason: false,
        };
      case "PROCESSING":
        return {
          readable: "Sedang dilakukan pengecekan...",
          showReason: false,
        };
      case "NOT_ELIGIBLE":
      default:
        return { readable: "Soal tidak layak dikerjakan.", showReason: true };
    }
  }, [isPending, isError, data]);

  useEffect(() => {
    const evtCallback = () => {
      // @ts-expect-error udah biarin aja ini mah (famous last word)
      const copiedMap = new Map<number, { user: UserAwareness }>(yProvider.awareness.getStates());
      copiedMap.delete(yProvider.awareness.clientID);

      if (copiedMap.size === 0) {
        setAnotherUsers([]);

        return;
      }

      const myself = yProvider.awareness.getLocalState() as unknown as { user: UserAwareness } | null;

      if (!myself) return;

      const newData = Array.from(copiedMap)
        .map(([_, d]) => d.user)
        .filter((user) => myself.user.image !== user.image);
      const removeDuplicate = Array.from(
        new Set(newData.map((nd) => nd.image)),
      ).map((img) => newData.find((d) => d.image === img)).filter(d => !!d) satisfies UserAwareness[];

      setAnotherUsers(removeDuplicate);
    };

    yProvider.awareness.on("change", evtCallback);

    return () => {
      yProvider.awareness.off("change", evtCallback);
    };
  }, [yProvider.awareness]);

  return (
    <div className="w-full md:fixed md:bottom-2 md:right-2 md:w-fit">
      {anotherJoinedUsers.length > 0 ? (
        <div className="mb-2 md:flex md:max-h-[45vh] md:flex-col md:items-center md:justify-center md:gap-1.5 md:overflow-y-auto">
          <TooltipProvider>
            {anotherJoinedUsers.map((user) => (
              <Tooltip key={user.image}>
                <TooltipTrigger>
                  <Avatar
                    className="border"
                    style={{ borderColor: user.color }}
                  >
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="uppercase">
                      {user.name ? user.name.slice(0, 2) : "N/A"}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      ) : null}
      <Sheet
        open={sheetOpened}
        onOpenChange={() => {
          setOpened((prev) => !prev);
        }}
      >
        <SheetTrigger asChild>
          <Button
            variant={isError ? "destructive" : "default"}
            className="h-10 w-full md:w-fit"
          >
            {isPending ? (
              <Loader2 className="!h-7 !w-7 animate-spin" />
            ) : data?.eligible === "NOT_ELIGIBLE" || isError ? (
              <OctagonX
                className={cn(
                  "!h-7 !w-7",
                  !isError && "text-red-500 dark:text-red-700",
                )}
              />
            ) : data?.eligible === "PROCESSING" ? (
              <LoaderPinwheel className="!h-7 !w-7 animate-spin" />
            ) : (
              <LaptopMinimalCheck className="!h-7 !w-7 text-green-500 dark:text-green-700" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Status Kelayakan Pengerjaan Soal</SheetTitle>
            <SheetDescription className="text-justify">
              Soal dapat dikatakan layak untuk dikerjakan oleh peserta apabila
              terdapat soal pilihan ganda atau soal esai atau ada keduanya.
              Setiap soal wajib memiliki pertanyaan dan opsi jawaban. Pada
              bagian ini, anda dapat mengetahui kesalahan yang anda dapat
              perbaiki.
            </SheetDescription>

            <p className="mt-2 text-wrap text-sm">
              Status saat ini: {currentStatus.readable}
            </p>

            {currentStatus.showReason ? (
              <p className="text-pretty text-sm">
                Alasan: {data?.notEligibleReason ?? "N/A"}
              </p>
            ) : null}

            {currentStatus.showReason && data?.detailedNotEligible ? (
              <div className="mt-12 flex max-h-[55vh] flex-col gap-5 overflow-y-auto pb-14">
                {data.detailedNotEligible.some(
                  (detail) => detail.type === "choice",
                ) ? (
                  <div className="space-y-2">
                    <p className="text-wrap text-base">
                      Kesalahan Pada Pilihan Ganda
                    </p>

                    <ul className="list-disc space-y-1.5 pl-5">
                      {data.detailedNotEligible
                        .filter((d) => d.type === "choice")
                        .map((d) => (
                          <li className="text-pretty text-sm" key={d.iqid}>
                            <button
                              className="underline"
                              onClick={() => {
                                const el = document.querySelector(
                                  `#choice-iqid-${d.iqid}`,
                                );

                                if (el) {
                                  setOpened(false);

                                  setTimeout(
                                    () =>
                                      el.scrollIntoView({ behavior: "smooth" }),
                                    585,
                                  );
                                }
                              }}
                            >
                              KE SOAL
                            </button>{" "}
                            | {d.errorMessage}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}

                {data.detailedNotEligible.some(
                  (detail) => detail.type === "essay",
                ) ? (
                  <div className="space-y-2">
                    <p className="text-wrap text-base">Kesalahan Pada Esai</p>

                    <ul className="list-disc space-y-1.5 pl-5">
                      {data.detailedNotEligible
                        .filter((d) => d.type === "essay")
                        .map((d) => (
                          <li className="text-pretty text-sm" key={d.iqid}>
                            <button
                              className="underline"
                              onClick={() => {
                                const el = document.querySelector(
                                  `#essay-iqid-${d.iqid}`,
                                );

                                if (el) {
                                  setOpened(false);

                                  setTimeout(
                                    () =>
                                      el.scrollIntoView({ behavior: "smooth" }),
                                    585,
                                  );
                                }
                              }}
                            >
                              KE SOAL
                            </button>{" "}
                            | {d.errorMessage}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
});
