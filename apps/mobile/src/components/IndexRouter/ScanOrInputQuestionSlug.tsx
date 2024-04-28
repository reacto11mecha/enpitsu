import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import slugify from "slugify";
import type { z } from "zod";

import { api } from "~/lib/api";
import { Precaution } from "./Precaution";
import { ScannerWrapper } from "./Scanner";
import { formSchema } from "./schema";

export const ScanOrInputQuestionSlug = ({
  closeScanner,
}: {
  closeScanner: () => void;
}) => {
  // const toast = useToastController();

  const [isPrecautionOpen, setOpen] = useState(false);

  const getQuestionMutation = api.exam.getQuestion.useMutation({
    onSuccess() {
      setOpen(true);
    },
    onError(_error) {
      // toast.show("Gagal mengerjakan soal", {
      //   message:
      //     error.message === "Failed to fetch"
      //       ? "Gagal meraih server"
      //       : error.message,
      // });
    },
  });

  const closePrecaution = useCallback(() => setOpen(false), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  });

  const sendMutate = useCallback(
    (slug: string) => {
      form.setValue("slug", slug);

      getQuestionMutation.mutate({ slug });
    },
    [form, getQuestionMutation],
  );

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    getQuestionMutation.mutate(values);

  return (
    <View className="flex h-screen w-screen -translate-y-16 flex-col items-center justify-center gap-5 p-5">
      <Text className="font-[SpaceMono] text-4xl text-gray-700 dark:text-gray-300">
        enpitsu
      </Text>

      <View className="w-[85%] md:w-[55%] lg:w-[50%]">
        <Controller
          control={form.control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex">
              <View>
                <Text className="font-semibold dark:text-gray-50">
                  Kode Soal
                </Text>
                <TextInput
                  placeholder="Masukan Kode Soal"
                  onBlur={onBlur}
                  className="font-space mt-2 rounded border p-2 pl-5 font-[IBMPlex] placeholder:pl-5 dark:border-gray-700 dark:text-gray-50 dark:placeholder:text-gray-500"
                  onChangeText={(text) =>
                    onChange(
                      slugify(text, {
                        trim: false,
                        strict: true,
                        remove: /[*+~.()'"!:@]/g,
                      }).toUpperCase(),
                    )
                  }
                  value={value}
                />
              </View>
              <Pressable
                className="mt-2 flex h-10 items-center justify-center rounded-lg bg-stone-900 dark:bg-stone-100"
                onPress={form.handleSubmit(onSubmit)}
              >
                <Text className="text-center text-slate-50 dark:text-stone-900">
                  Kerjakan
                </Text>
              </Pressable>
            </View>
          )}
          name="slug"
        />
      </View>

      <Precaution
        open={isPrecautionOpen}
        close={closePrecaution}
        data={getQuestionMutation.data}
      />
    </View>
  );
};
