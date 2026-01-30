"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type {
  AddStudentSchema,
  TAddStudentSchema,
} from "@enpitsu/validator/grade";
import { validateId } from "@enpitsu/token-generator";
import { AddStudentConstructor } from "@enpitsu/validator/grade";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const AddStudentSchema = AddStudentConstructor({
  validator: validateId,
  minimalTokenLength: 13,
  maximalTokenLength: 14,
});

export const AddStudent = ({
  grade,
  subgrade,
}: {
  grade: {
    id: number;
    label: string;
  };
  subgrade: {
    id: number;
    label: string;
    gradeId: number;
  };
}) => {
  const [open, setOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<TAddStudentSchema>({
    resolver: zodResolver(AddStudentSchema),
    defaultValues: {
      name: "",
      participantNumber: "",
    },
  });

  const createStudentMutation = useMutation(
    trpc.grade.createStudent.mutationOptions({
      async onSuccess() {
        form.reset();

        await queryClient.invalidateQueries(
          trpc.grade.getStudents.pathFilter(),
        );

        setOpen(false);

        toast.success("Penambahan Berhasil!", {
          description: `Berhasil menambahkan murid baru di kelas ${grade.label} ${subgrade.label}.`,
        });
      },

      onError(error) {
        toast.error("Operasi Gagal", {
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
    }),
  );

  function onSubmit(values: TAddStudentSchema) {
    createStudentMutation.mutate({ ...values, subgradeId: subgrade.id });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (!createStudentMutation.isPending) setOpen((prev) => !prev);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          Tambah Murid <UserPlus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Tambah Murid</DialogTitle>
          <DialogDescription>
            Tambah murid baru di kelas{" "}
            <b>
              {grade.label} {subgrade.label}
            </b>
            . Nama akan otomatis tersortir dari A ke Z.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Murid</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={createStudentMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan nama murid yang akan menjadi peserta ujian.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participantNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Murid</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={createStudentMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan nomor peserta ujian.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ruang Ujian</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={createStudentMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan nomor ruangan peserta ujian.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Peserta</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={createStudentMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan token peserta ujian.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={createStudentMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            disabled={createStudentMutation.isPending}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {createStudentMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Tambah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
