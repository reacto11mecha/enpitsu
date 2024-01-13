import { SafeAreaView } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { validateId } from "@enpitsu/token-generator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Controller, useForm } from "react-hook-form";
import { Button, Card, H3, Input, Paragraph, Text, YStack } from "tamagui";
import { z } from "zod";

import { studentTokenAtom } from "~/lib/atom";

const formSchema = z.object({
  token: z
    .string()
    .min(1, {
      message: "Token wajib di isi!",
    })
    .min(8, { message: "Panjang token wajib 8 karakter!" })
    .max(8, { message: "Panjang token tidak boleh dari 8 karakter!" })
    .refine(validateId, { message: "Format token tidak sesuai!" }),
});

export const InsertToken = () => {
  const [token, setToken] = useAtom(studentTokenAtom);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    setToken(values.token);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <StatusBar />
      <SafeAreaView>
        <YStack h="100%" d="flex" jc="center" px={20}>
          <Card elevate>
            <Card.Header>
              <H3>Masukan Token</H3>

              <Paragraph>
                Masukan token yang tertera pada kartu ujian pada kolom input
                dibawah ini. Proses ini hanya di awal saja, namun bisa diganti
                kapan saja di halaman pengaturan.
              </Paragraph>
            </Card.Header>
            <Card.Footer
              px={15}
              pb={20}
              width="100%"
              d="flex"
              fd="col"
              gap={10}
            >
              <YStack>
                <Controller
                  control={control}
                  name="token"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      w="100%"
                      placeholder="ABC12XX"
                      fontFamily={"SpaceMono_400Regular"}
                      onBlur={onBlur}
                      onChangeText={(val) =>
                        val.trim().length <= 8 &&
                        onChange(val.toUpperCase().trim())
                      }
                      value={value}
                    />
                  )}
                />

                {errors.token ? (
                  <Text fontSize={"$2"} ml={3} color={"red"}>
                    {errors.token?.message}
                  </Text>
                ) : null}
              </YStack>

              <Button onPress={handleSubmit(onSubmit)}>Simpan</Button>
            </Card.Footer>
          </Card>
        </YStack>
      </SafeAreaView>
    </>
  );
};
