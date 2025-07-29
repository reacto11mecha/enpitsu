"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@enpitsu/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@enpitsu/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@enpitsu/ui/dialog";
import { Input } from "@enpitsu/ui/input";
import { Skeleton } from "@enpitsu/ui/skeleton";
import { ChevronsRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "~/trpc/react";

export const AngkatanViewer = () => {
  const [open, setOpen] = useState(false);
  const [currentDeleteID, setCurrentDeleteID] = useState<null | number>(null);
  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya ingin menghapus angkatan ini",
    [confirmationText],
  );

  const queryClient = useQueryClient();

  const grades = api.grade.getGrades.useQuery(undefined);

  const gradeDeleteMutation = api.grade.deleteGrade.useMutation({
    async onSuccess() {
      setOpen(false);

      setConfirmText("");
      setCurrentDeleteID(null);

      await apiUtils.grade.invalidate();

      toast.success("Penghapusan Berhasil!", {
        description: "Berhasil menghapus seluruh data angkatan.",
      });
    },
    onError(error) {
      toast.error("Operasi Gagal", {
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {grades.isPending ? (
        <>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </>
      ) : null}

      {!grades.isPending && grades.data && grades.data.length === 0
        ? "Belum ada data."
        : null}

      {!grades.isPending &&
        grades.data?.map((grade) => (
          <Card key={grade.id}>
            <CardHeader />
            <CardContent>
              <h3 className="scroll-m-20 text-center text-2xl font-semibold tracking-tight">
                {grade.label}
              </h3>
            </CardContent>
            <CardFooter className="mt-5 flex justify-center gap-3">
              <Button asChild>
                <Link href={`/admin/angkatan/${grade.id}`}>
                  <ChevronsRight />
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setOpen(true);
                  setCurrentDeleteID(grade.id);
                }}
              >
                <Trash2 />
              </Button>
            </CardFooter>
          </Card>
        ))}

      <Dialog
        open={open}
        onOpenChange={() => {
          if (!gradeDeleteMutation.isPending) setOpen((prev) => !prev);

          if (confirmationText.length > 0) setConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader className="flex flex-col gap-2">
            <DialogTitle>Apakah anda yakin?</DialogTitle>
            <DialogDescription>
              Aksi yang anda lakukan dapat berakibat fatal. Jika anda melakukan
              hal ini, maka akan secara permanen menghapus data angkatan{" "}
              <b>
                kelas{" "}
                {grades.data &&
                  currentDeleteID &&
                  grades.data.find((grade) => grade.id === currentDeleteID)!
                    .label}
              </b>
              .
            </DialogDescription>
            <DialogDescription className="text-start">
              Sebelum menghapus, ketik <b>saya ingin menghapus angkatan ini</b>{" "}
              pada kolom dibawah:
            </DialogDescription>
            <Input
              type="text"
              autoComplete="false"
              autoCorrect="false"
              disabled={gradeDeleteMutation.isPending}
              value={confirmationText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                disabled={gradeDeleteMutation.isPending}
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={!reallySure || gradeDeleteMutation.isPending}
              onClick={() => {
                if (reallySure) gradeDeleteMutation.mutate(currentDeleteID!);
              }}
            >
              {gradeDeleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
              ) : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
