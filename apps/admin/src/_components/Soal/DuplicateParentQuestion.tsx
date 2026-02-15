import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";

import type { TDuplicateQuestionSchema } from "@enpitsu/validator/question";
import { DuplicateQuestionSchema } from "@enpitsu/validator/question";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
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

export const DuplicateParentQuestion = ({
  openDuplicate,
  setOpenDuplicate,
  title,
  id,
  slug,
}: {
  openDuplicate: boolean;
  setOpenDuplicate: Dispatch<SetStateAction<boolean>>;
  title: string;
  slug: string;
  id: number;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const duplicateQuestionMutation = useMutation(
    trpc.question.duplicateQuestion.mutationOptions({
      async onSuccess(returnValue) {
        setOpenDuplicate(false);

        await queryClient.invalidateQueries(
          trpc.question.getQuestions.pathFilter(),
        );

        toast.success("Duplikasi Berhasil!", {
          description: `Berhasil menduplikasi soal "${title}"`,
        });

        router.push(`/admin/soal/edit/${returnValue.newQuestionId}`);
      },
      onError(error) {
        toast.error("Operasi Gagal", {
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
    }),
  );

  const form = useForm<TDuplicateQuestionSchema>({
    resolver: zodResolver(DuplicateQuestionSchema),
    defaultValues: {
      slug,
      id,
    },
  });

  const slugField = form.watch("slug");

  return (
    <AlertDialog
      open={openDuplicate}
      onOpenChange={() => {
        if (!duplicateQuestionMutation.isPending)
          setOpenDuplicate((prev) => !prev);

        form.reset();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplikat Soal</AlertDialogTitle>
          <AlertDialogDescription className="text-justify">
            Anda akan menduplikasi soal yang berjudul <b>{title}</b> dengan kode
            soal awal <b>{slug}</b>. Duplikasi soal ini hanya menduplikasi
            pertanyaan, tidak dengan jawaban peserta dan daftar kecurangan.
            Untuk menduplikasi, mohon masukan kode soal yang baru agar tidak
            bertabrakan dengan kode yang sudah ada.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((val) =>
              duplicateQuestionMutation.mutate(val),
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Soal yang Baru</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
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
                      disabled={duplicateQuestionMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan kode soal baru yang berbeda dengan soal asli.
                    Pastikan kode soal yang baru tidak bertabrakan dengan soal
                    yang sudah ada.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {duplicateQuestionMutation.isPending ? (
              <AlertDialogDescription className="text-center font-medium">
                Jangan tutup tab browser ini sampai proses duplikasi selesai.
              </AlertDialogDescription>
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={duplicateQuestionMutation.isPending}>
                Batal
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={
                  duplicateQuestionMutation.isPending || slugField === slug
                }
              >
                {duplicateQuestionMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
                ) : null}
                Duplikat
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
