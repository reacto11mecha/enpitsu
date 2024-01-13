import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// import { useAtom } from "jotai";
import { Controller, useForm } from "react-hook-form";

// import { studentTokenAtom } from "~/lib/atom";

export const InsertToken = () => {
  // const [token, setToken] = useAtom(studentTokenAtom);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      token: "",
    },
  });
  const onSubmit = (data: { token: string }) => console.log(data);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <StatusBar />
      <SafeAreaView>
        <View className="flex h-full w-full items-center justify-center">
          <View>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Masukan token"
                  onBlur={onBlur}
                  onChangeText={(val) => {
                    if (val.length <= 8) {
                      onChange(val);
                    }
                  }}
                  value={value}
                />
              )}
              name="token"
            />
            {errors.token && <Text>This is required.</Text>}

            <Button title="Submit" onPress={handleSubmit(onSubmit)} />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};
