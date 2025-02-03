"use client";

import { useRouter } from "next/navigation";
import { Button } from "@enpitsu/ui/button";
import { Checkbox } from "@enpitsu/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import { Input } from "@enpitsu/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@enpitsu/ui/select";
import { Separator } from "@enpitsu/ui/separator";
import { Skeleton } from "@enpitsu/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfDay } from "date-fns";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/trpc/react";

const formSchema = z
  .object({
    title: z.string().min(5, { message: "Minimal memiliki 5 karakter!" }),
    slug: z.string().min(4, { message: "Minimal memiliki 4 karakter!" }),
    multipleChoiceOptions: z.coerce
      .number()
      .min(0, {
        message: "Pilihlah salah satu banyak opsi jawaban pilihan ganda!",
      })
      .min(4)
      .max(5),
    startedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian dimulai!",
    }),
    endedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian selesai!",
    }),
    allowLists: z.array(z.number()).min(1, {
      message: "Minimal terdapat satu kelas yang bisa mengerjakan soal!",
    }),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    path: ["endedAt"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export const NewParentQuestion = () => {
  const router = useRouter();

  const apiUtils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      multipleChoiceOptions: 5,
      allowLists: [],
      title: "",
      slug: "",
    },
  });

  const subgradeForAllowListQuery =
    api.question.getSubgradeForAllowList.useQuery();

  const createQuestionMutation = api.question.createQuestion.useMutation({
    async onSuccess(result) {
      form.reset();

      await apiUtils.grade.getStudents.invalidate();

      toast.success("Penambahan Berhasil!", {
        description: `Berhasil menambahkan soal baru!`,
      });

      router.replace(`/admin/soal/butir/${result.id}`);
    },

    onError(error) {
      toast.error("Operasi Gagal", {
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createQuestionMutation.mutate({ ...values });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Soal</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="off"
                  placeholder="MATEMATIKA WAJIB XII"
                  disabled={
                    subgradeForAllowListQuery.isPending ||
                    createQuestionMutation.isPending
                  }
                />
              </FormControl>
              <FormDescription>
                Masukan judul soal yang akan menjadi keterangan soal.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Soal</FormLabel>
              <FormControl>
                <Input
                  value={field.value}
                  onChange={(el) =>
                    field.onChange(
                      slugify(el.target.value, {
                        trim: false,
                        strict: true,
                        remove: /[*+~.()'"!:@]/g,
                      }).toUpperCase(),
                    )
                  }
                  autoComplete="off"
                  placeholder="MATWA-XII"
                  disabled={
                    subgradeForAllowListQuery.isPending ||
                    createQuestionMutation.isPending
                  }
                />
              </FormControl>
              <FormDescription>
                Masukan kode soal yang nantinya akan menjadi Kode QR yang dapat
                di scan oleh peserta.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="multipleChoiceOptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah opsi pilihan ganda</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger
                    disabled={
                      subgradeForAllowListQuery.isPending ||
                      createQuestionMutation.isPending
                    }
                  >
                    <SelectValue placeholder="Mohon pilih salah satu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5">5 Butir</SelectItem>
                  <SelectItem value="4">4 Butir</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Pilih jumlah banyaknya opsi pilihan ganda, pilihan ini tidak
                bisa di ubah.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    min={format(startOfDay(new Date()), "yyyy-MM-dd'T'HH:mm")}
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
                      subgradeForAllowListQuery.isPending ||
                      createQuestionMutation.isPending
                    }
                  />
                </FormControl>
                <FormDescription>
                  Tentukan kapan peserta bisa mulai mengerjakan soal.
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
                      subgradeForAllowListQuery.isPending ||
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      !form.getValues("startedAt") ||
                      createQuestionMutation.isPending
                    }
                  />
                </FormControl>
                <FormDescription>
                  Tentukan kapan batas waktu maksimal peserta dapat mengumpulkan
                  jawaban.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="allowLists"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daftar Putih Pengerjaan Soal</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-8 py-5">
                  {subgradeForAllowListQuery.isPending ? (
                    <Skeleton className="h-32 w-full" />
                  ) : null}

                  {!subgradeForAllowListQuery.isPending &&
                    !subgradeForAllowListQuery.isError &&
                    subgradeForAllowListQuery.data.map((grade) => (
                      <>
                        {grade.subgrades.length > 0 && (
                          <div key={grade.id}>
                            <div className="flex flex-row items-center gap-2">
                              <Checkbox
                                id={`parent-grade-${grade.id}`}
                                checked={grade.subgrades.every((subgrade) =>
                                  field.value.includes(subgrade.id),
                                )}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        ...grade.subgrades.map((s) => s.id),
                                      ])
                                    : field.onChange(
                                        field.value.filter(
                                          (value) =>
                                            !grade.subgrades
                                              .map((s) => s.id)
                                              .includes(value),
                                        ),
                                      );
                                }}
                                disabled={createQuestionMutation.isPending}
                              />
                              <label
                                htmlFor={`parent-grade-${grade.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Kelas {grade.label}
                              </label>
                            </div>

                            <Separator className="my-3" />

                            <div className="flex flex-row gap-4">
                              {grade.subgrades.map((subgrade) => (
                                <FormField
                                  key={subgrade.id}
                                  control={form.control}
                                  name="allowLists"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={subgrade.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value.includes(
                                              subgrade.id,
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    subgrade.id,
                                                  ])
                                                : field.onChange(
                                                    field.value.filter(
                                                      (value) =>
                                                        value !== subgrade.id,
                                                    ),
                                                  );
                                            }}
                                            disabled={
                                              createQuestionMutation.isPending
                                            }
                                          />
                                        </FormControl>
                                        <FormLabel>{subgrade.label}</FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ))}
                </div>
              </FormControl>
              <FormDescription>
                Tentukan kelas mana saja yang bisa mengerjakan soal ini.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            subgradeForAllowListQuery.isPending ||
            createQuestionMutation.isPending
          }
        >
          {createQuestionMutation.isPending ? (
            <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
          ) : null}
          Buat
        </Button>
      </form>
    </Form>
  );
};
