"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfDay } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";

const formSchema = z
  .object({
    studentId: z.number().min(1, { message: "Pilih nama salah satu peserta!" }),
    startedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian dimulai!",
    }),
    endedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian selesai!",
    }),
    reason: z
      .string()
      .min(3, { message: "Minimal alasan memiliki 3 karakter!" }),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    path: ["endedAt"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export function AddBannedStudent() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedSubgradeId, setSubgradeId] = useState<number | null>(null);

  const { toast } = useToast();

  const apiUtils = api.useUtils();

  const addNewBannedStudent = api.grade.addTemporaryBan.useMutation({
    async onSuccess() {
      setSubgradeId(null);
      form.reset();

      await apiUtils.question.getStudentTempobans.invalidate();

      toast({
        title: "Penambahan Larangan Berhasil!",
        description: `Berhasil menambahkan peserta!`,
      });

      setDialogOpen(false);
    },

    onError(error) {
      toast({
        variant: "destructive",
        title: "Operasi Gagal",
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });
  const subgradesWithGrade = api.grade.getSubgradesWithGrade.useQuery();
  const studentLists = api.grade.getStudents.useQuery({
    subgradeId: selectedSubgradeId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 0,
      reason: "",
    },
  });

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        if (addNewBannedStudent.isLoading) return;

        form.reset();
        setSubgradeId(null);

        setDialogOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>
        <Button>Tambah peserta</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambahkan Larangan Untuk peserta</DialogTitle>
          <DialogDescription>
            Pilih peserta dari daftar yang sudah dibuat. Pilih peserta dari
            spesifik kelas, tentukan durasi, dan berikan alasan yang jelas.
            Masing-masing peserta hanya mendapatkan satu kesempatan larangan.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((val) =>
                addNewBannedStudent.mutate(val),
              )}
              className="space-y-3"
            >
              <div className="flex flex-col gap-5 md:grid md:grid-cols-4">
                <div className="flex flex-col md:w-[150px]">
                  <FormLabel className="mb-2">Kelas</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const subgradeId = parseInt(value);

                        setSubgradeId((prevId) => {
                          if (prevId === subgradeId) return prevId;

                          form.resetField("studentId");

                          return subgradeId;
                        });
                      }}
                      disabled={
                        subgradesWithGrade.isLoading ||
                        subgradesWithGrade.isError ||
                        addNewBannedStudent.isLoading
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas peserta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="mt-14">
                            Daftar kelas
                          </SelectLabel>
                          {subgradesWithGrade.data?.map((subgrade) => (
                            <SelectItem
                              key={subgrade.id}
                              value={`${subgrade.id}`}
                            >
                              {subgrade.grade.label} {subgrade.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className="mt-1">
                    Pilih kelas asal supaya bisa memilih peserta.
                  </FormDescription>
                  <FormMessage />
                </div>

                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Nama Peserta</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            value && field.onChange(parseInt(value))
                          }
                          value={field.value === 0 ? "" : String(field.value)}
                          disabled={
                            subgradesWithGrade.isLoading ||
                            subgradesWithGrade.isError ||
                            !selectedSubgradeId ||
                            studentLists.isLoading ||
                            studentLists.isError ||
                            addNewBannedStudent.isLoading
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kelas peserta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="mt-14">
                                Daftar nama peserta
                              </SelectLabel>

                              {!studentLists.isLoading &&
                              !studentLists.isError ? (
                                <>
                                  {studentLists.data.length < 1 ? (
                                    <SelectLabel className="font-normal text-red-500">
                                      Tidak ada data peserta di kelas ini!
                                    </SelectLabel>
                                  ) : (
                                    <>
                                      {studentLists.data.map((student) => (
                                        <SelectItem
                                          key={student.id}
                                          value={`${student.id}`}
                                        >
                                          {student.name}
                                        </SelectItem>
                                      ))}
                                    </>
                                  )}
                                </>
                              ) : (
                                <></>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Pilih peserta spesifik dari list yang ada.
                      </FormDescription>
                      <FormMessage />
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
                            !selectedSubgradeId ||
                            studentLists.isLoading ||
                            studentLists.isError ||
                            addNewBannedStudent.isLoading
                          }
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
                            form.getValues("startedAt")
                              ? format(
                                  form.getValues("startedAt"),
                                  "yyyy-MM-dd'T'HH:mm",
                                )
                              : ""
                          }
                          value={
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
                            !selectedSubgradeId ||
                            studentLists.isLoading ||
                            studentLists.isError ||
                            !form.getValues("startedAt") ||
                            addNewBannedStudent.isLoading
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
                        disabled={
                          !selectedSubgradeId ||
                          studentLists.isLoading ||
                          studentLists.isError ||
                          addNewBannedStudent.isLoading
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Masukan alasan yang akan diterima oleh peserta tersebut.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={
                  !selectedSubgradeId ||
                  studentLists.isLoading ||
                  studentLists.isError ||
                  addNewBannedStudent.isLoading
                }
              >
                Tambah
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
