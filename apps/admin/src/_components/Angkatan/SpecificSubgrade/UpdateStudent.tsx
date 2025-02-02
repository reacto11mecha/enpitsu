import type { RouterOutputs } from "@enpitsu/api";
import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";
import { Button } from "@enpitsu/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@enpitsu/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import { Input } from "@enpitsu/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/trpc/react";

const schema = z.object({
  name: z
    .string()
    .min(2, { message: "Nama wajib di isi!" })
    .max(255, { message: "Nama terlalu panjang!" }),
  participantNumber: z
    .string()
    .min(5, { message: "Nomor peserta wajib di isi!" })
    .max(50, { message: "Panjang maksimal hanya 50 karakter!" }),
  room: z
    .string()
    .min(1, { message: "Ruangan peserta wajib di isi!" })
    .max(50, { message: "Panjang maksimal hanya 50 karakter!" }),
});

type FormValues = z.infer<typeof schema>;

type StudentType = RouterOutputs["grade"]["getStudents"][number];

export const UpdateStudent = ({
  openEdit,
  setOpenEdit,
  student,
}: {
  openEdit: boolean;
  setOpenEdit: Dispatch<SetStateAction<boolean>>;
  student: StudentType;
}) => {
  const apiUtils = api.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: student.name,
      room: student.room,
      participantNumber: student.participantNumber,
    },
  });

  const nameValue = useWatch({
    control: form.control,
    name: "name",
  });

  const participantNumberValue = useWatch({
    control: form.control,
    name: "participantNumber",
  });

  const roomValue = useWatch({
    control: form.control,
    name: "room",
  });

  const isTheSameValue = useMemo(
    () =>
      [
        nameValue === student.name,
        participantNumberValue === student.participantNumber,
        roomValue === student.room,
      ].every((value) => value),
    [
      nameValue,
      participantNumberValue,
      roomValue,
      student.name,
      student.participantNumber,
      student.room,
    ],
  );

  const editStudentMutation = api.grade.updateStudent.useMutation({
    async onSuccess() {
      await apiUtils.grade.getStudents.invalidate();

      setOpenEdit(false);

      toast.success("Pembaruan Berhasil!", {
        description: "Berhasil memperbarui identitas murid.",
      });
    },

    onError(error) {
      toast.error("Operasi Gagal", {
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  const onSubmit = (values: FormValues) =>
    editStudentMutation.mutate({ id: student.id, ...values });

  return (
    <Dialog
      open={openEdit}
      onOpenChange={() => {
        if (!editStudentMutation.isPending) setOpenEdit((prev) => !prev);
      }}
    >
      <DialogContent className="md:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>Perbaiki Identitas</DialogTitle>
          <DialogDescription>
            Perbarui identitas murid yang mungkin salah dalam penulisan nama
            ataupun identitas lainnya.
          </DialogDescription>
          <Form {...form}>
            <form
              className="w-full py-3"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-col items-end gap-5 text-start md:flex-row">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Nama Murid</FormLabel>
                      <FormControl className="w-full">
                        <Input
                          placeholder="1"
                          {...field}
                          autoComplete="off"
                          disabled={editStudentMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="participantNumber"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Nomor Peserta Ujian</FormLabel>
                      <FormControl className="w-full">
                        <Input
                          placeholder="1"
                          {...field}
                          autoComplete="off"
                          disabled={editStudentMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Ruangan</FormLabel>
                      <FormControl className="w-full">
                        <Input
                          placeholder="1"
                          {...field}
                          autoComplete="off"
                          disabled={editStudentMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={editStudentMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={isTheSameValue || editStudentMutation.isPending}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {editStudentMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Ubah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
