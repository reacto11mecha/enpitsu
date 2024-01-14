import React from "react";
import { SafeAreaView } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { Controller, useForm } from "react-hook-form";
import { Button, Input, Label, Spinner, Text, XStack, YStack } from "tamagui";
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
  const [isPrecautionOpen, setOpen] = React.useState(false);

  const getQuestionMutation = api.exam.getQuestion.useMutation({
    onSuccess() {
      setOpen(true);
    },
    onError(error) {
      // toast({
      //   duration: 9500,
      //   variant: "destructive",
      //   description:
      //     error.message === "Failed to fetch"
      //       ? "Gagal meraih server"
      //       : error.message,
      // });
    },
  });

  const closePrecaution = React.useCallback(() => setOpen(false), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  });

  const sendMutate = React.useCallback(
    (slug: string) => {
      form.setValue("slug", slug);

      getQuestionMutation.mutate({ slug });
    },
    [form, getQuestionMutation],
  );

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    getQuestionMutation.mutate(values);

  return (
    <SafeAreaView>
      <YStack h="100%" d="flex" jc="center" ai="center" gap={20} px={20}>
        <XStack>
          <Controller
            control={form.control}
            name="slug"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack d="flex">
                <Label lineHeight={30} ml={3}>
                  Kode soal
                </Label>
                <XStack space="$2">
                  <Input
                    w={getQuestionMutation.isLoading ? "65%" : "70%"}
                    disabled={getQuestionMutation.isLoading}
                    placeholder="Masukan kode soal"
                    fontFamily={"SpaceMono_400Regular"}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <Button
                    disabled={getQuestionMutation.isLoading}
                    onPress={form.handleSubmit(onSubmit)}
                    icon={getQuestionMutation.isLoading ? <Spinner /> : <></>}
                  >
                    Kerjakan
                  </Button>
                </XStack>
                {form.formState.errors.slug ? (
                  <Text color="red" fontSize={10} ml={5}>
                    {form.formState.errors.slug.message}
                  </Text>
                ) : null}
              </YStack>
            )}
          />
        </XStack>

        <ScannerWrapper
          sendMutate={sendMutate}
          isDisabled={getQuestionMutation.isLoading}
        />

        <XStack>
          <Button icon={<ArrowLeft size={20} />} onPress={closeScanner} />
        </XStack>
      </YStack>

      <Precaution
        open={isPrecautionOpen}
        close={closePrecaution}
        data={getQuestionMutation.data}
      />
    </SafeAreaView>
  );
};
