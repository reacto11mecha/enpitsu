"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X as NuhUh, Check as YuhUh } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";

const formSchema = z.object({
  score: z.coerce
    .number({
      invalid_type_error: "Hanya bisa di isikan nilai angka!",
      required_error: "Skor dibutuhkan!",
    })
    .min(0, { message: "Skor minimum di angka 0!" })
    .max(1, { message: "Skor maximum di angka 1!" }),
});

export const UpdateEssayScore = ({
  score,
  id,
  respondId,
}: {
  score: string;
  id: number;
  respondId: number;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: parseFloat(score),
    },
  });

  const apiUtils = api.useUtils();
  const updateScoreMutation = api.question.updateEssayScore.useMutation({
    async onMutate(updatedData) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await apiUtils.question.getEssaysScore.cancel();

      // Get the data from the queryCache
      const prevData = apiUtils.question.getEssaysScore.getData();

      // Optimistically update the data with our new post
      apiUtils.question.getEssaysScore.setData({ respondId }, (old) =>
        old?.map((d) =>
          d.id === id ? { ...d, score: String(updatedData.score) } : d,
        ),
      );

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      apiUtils.question.getEssaysScore.setData({ respondId }, ctx?.prevData);
    },
    onSuccess(data) {
      form.setValue("score", parseFloat(data.at(0)!.score));
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await apiUtils.question.getEssaysScore.invalidate();
    },
  });
  const onSubmit = ({ score }: z.infer<typeof formSchema>) => {
    updateScoreMutation.mutate({ score, id });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Poin dalam bilangan koma antara 0 dan 1</FormLabel>
              <FormControl className="w-full">
                <div className="flex w-full flex-row items-center gap-5">
                  <Input
                    min={0}
                    max={1}
                    step={0.015}
                    className="w-full"
                    disabled={updateScoreMutation.isLoading}
                    {...field}
                  />
                  {updateScoreMutation.isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : updateScoreMutation.isError ? (
                    <NuhUh className="h-8 w-8 text-red-600 dark:text-red-500" />
                  ) : (
                    <YuhUh className="h-8 w-8 text-green-600 dark:text-green-500" />
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Perbarui skor jika dianggap kurang, lalu tekan enter.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
