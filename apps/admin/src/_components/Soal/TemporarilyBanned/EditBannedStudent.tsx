"use client";

import type { Dispatch, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfDay } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { TEditBannedStudentSchema } from "@enpitsu/validator/exam";
import { EditBannedStudentSchema } from "@enpitsu/validator/exam";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useTRPC } from "~/trpc/react";

export function EditBannedStudent({
  studentId,
  reason,
  studentName,
  studentClassName,
  startedAt,
  endedAt,
  isDialogOpen,
  setDialogOpen,
}: {
  studentId: number;
  reason: string;
  studentName: string;
  studentClassName: string;
  startedAt: Date;
  endedAt: Date;
  isDialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const editBannedStudent = useMutation(
    trpc.grade.editTemporaryBan.mutationOptions({
      async onSuccess() {
        await queryClient.invalidateQueries(
          trpc.question.getStudentTempobans.pathFilter(),
        );

        toast.success("Pembaharuan Larangan Berhasil!", {
          description: `Berhasil mengubah peserta!`,
        });

        setDialogOpen(false);
      },

      onError(error) {
        toast.error("Operasi Gagal", {
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
    }),
  );

  const form = useForm<TEditBannedStudentSchema>({
    resolver: zodResolver(EditBannedStudentSchema),
    defaultValues: {
      studentName,
      reason,
      startedAt,
      endedAt,
    },
  });

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        if (editBannedStudent.isPending) return;

        setDialogOpen((prev) => !prev);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Larangan Peserta</DialogTitle>
          <DialogDescription>
            Perbarui durasi dan alasan peserta ini.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((val) =>
                editBannedStudent.mutate({
                  studentId,
                  startedAt: val.startedAt,
                  endedAt: val.endedAt,
                  reason: val.reason,
                }),
              )}
              className="space-y-3"
            >
              <div className="flex flex-col gap-5 md:grid md:grid-cols-4">
                <div className="flex flex-col md:w-[150px]">
                  <FormLabel className="mb-2">Kelas</FormLabel>
                  <FormControl>
                    <Input disabled value={studentClassName} />
                  </FormControl>
                </div>

                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Nama Peserta</FormLabel>
                      <FormControl>
                        <Input disabled value={field.value} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
                <FormField
                  control={form.control}
                  name="startedAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Waktu Mulai</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          type="datetime-local"
                          min={format(
                            startOfDay(new Date()),
                            "yyyy-MM-dd'T'HH:mm",
                          )}
                          value={
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            field.value
                              ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                              : ""
                          }
                          onChange={(e) =>
                            e.target.value === ""
                              ? field.onChange(undefined)
                              : field.onChange(new Date(e.target.value))
                          }
                          disabled={editBannedStudent.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Tentukan kapan batas waktu awal peserta dibatasi
                        pengerjaannya.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endedAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Waktu Selesai</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          min={
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            form.getValues("startedAt")
                              ? format(
                                  form.getValues("startedAt"),
                                  "yyyy-MM-dd'T'HH:mm",
                                )
                              : ""
                          }
                          value={
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            field.value
                              ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                              : ""
                          }
                          onChange={(e) =>
                            e.target.value === ""
                              ? field.onChange(undefined)
                              : field.onChange(new Date(e.target.value))
                          }
                          disabled={
                            editBannedStudent.isPending ||
                            !form.getValues("startedAt")
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Tentukan kapan batas waktu akhir peserta dibatasi
                        pengerjaannya.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        placeholder="Masukan alasan logis"
                        disabled={editBannedStudent.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Masukan alasan yang akan diterima oleh peserta tersebut.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={editBannedStudent.isPending}>
                Edit
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
