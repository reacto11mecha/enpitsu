import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { toast } from "@/lib/sonner";
import { useTRPC } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

const formSchema = z.object({
  slug: z
    .string()
    .min(1, { message: "Kode soal wajib di isi!" })
    .min(4, { message: "Kode soal minimal memiliki panjang 4 karakter" }),
});

export function ScanOrInputQuestionSlug() {
  const [isPrecautionOpen, setOpen] = useState(false);

  const trpc = useTRPC();
  const getQuestionMutation = useMutation(
    trpc.exam.getQuestion.mutationOptions({
      onSuccess(data) {
        setOpen(true);

        router.replace({
          pathname: "/(protected)/test/[slug]",
          params: { slug: data.slug },
        });
      },
      onError(error) {
        toast.error("Gagal mengambil data soal", {
          description: error.message,
        });
      },
    }),
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    getQuestionMutation.mutate(values);

  return (
    <View>
      <Text>Masukan kode soal</Text>

      <Text>Kode Soal</Text>
      <Controller
        control={control}
        name="slug"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
            }}
            onBlur={onBlur}
            onChangeText={(val) =>
              !getQuestionMutation.isPending &&
              onChange(
                slugify(val, {
                  trim: false,
                  strict: true,
                  remove: /[*+~.()'"!:@]/g,
                }).toUpperCase(),
              )
            }
            value={value}
            placeholder="Masukkan kode soal disini."
          />
        )}
      />
      {errors.slug && (
        <Text style={{ color: "red" }}>{errors.slug.message}</Text>
      )}

      <Button
        title="Kerjakan soal"
        onPress={handleSubmit(onSubmit)}
        disabled={getQuestionMutation.isPending}
      />
    </View>
  );
}
