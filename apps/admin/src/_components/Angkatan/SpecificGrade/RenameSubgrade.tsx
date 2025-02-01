import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { api } from "~/trpc/react";

const schema = z.object({
  label: z.string().min(1, { message: "Harus ada isinya!" }),
});

export const RenameSubgrade = ({
  openEdit,
  setOpenEdit,
  label,
  param,
  id,
}: {
  openEdit: boolean;
  setOpenEdit: Dispatch<SetStateAction<boolean>>;
  label: string;
  param: string;
  id: number;
}) => {
  const apiUtils = api.useUtils();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: param,
    },
  });

  const labelValue = useWatch({
    control: form.control,
    name: "label",
  });

  const isSameEditValue = useMemo(
    () => labelValue === param,
    [param, labelValue],
  );

  const editSubgradeMutation = api.grade.updateSubgrade.useMutation({
    async onSuccess() {
      await apiUtils.grade.getSubgrades.invalidate();

      setOpenEdit(false);

      toast({
        title: "Pembaruan Berhasil!",
        description: "Berhasil mengubah nama kelas .",
      });
    },

    onError(error) {
      toast({
        variant: "destructive",
        title: "Operasi Gagal",
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) =>
    editSubgradeMutation.mutate({ id, label: values.label });

  return (
    <Dialog
      open={openEdit}
      onOpenChange={() => {
        if (!editSubgradeMutation.isLoading) setOpenEdit((prev) => !prev);
      }}
    >
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Ubah Nama</DialogTitle>
          <DialogDescription>
            Ubah nama <b>kelas {label}</b> menjadi nama yang lain.
          </DialogDescription>
          <Form {...form}>
            <form
              className="w-full pb-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-row items-end gap-5">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Nama Sub Kelas</FormLabel>
                      <FormControl className="w-full">
                        <Input
                          placeholder="1"
                          {...field}
                          autoComplete="off"
                          disabled={editSubgradeMutation.isLoading}
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
              disabled={editSubgradeMutation.isLoading}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={isSameEditValue || editSubgradeMutation.isLoading}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {editSubgradeMutation.isLoading ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Ubah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
