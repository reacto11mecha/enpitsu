import React from "react";
import { SafeAreaView } from "react-native";
import {
  Button,
  Card,
  H3,
  Input,
  Paragraph,
  Spinner,
  Text,
  YStack,
} from "tamagui";

import { api } from "~/lib/api";

const Index = () => {
  const studentQuery = api.exam.getStudent.useQuery(undefined, {
    onError(error) {
      // toast({
      //   duration: 9500,
      //   variant: "destructive",
      //   title: "Gagal mengambil data pribadi",
      //   description: `Operasi mengambil data gagal, mohon coba lagi. Error: ${error.message === "Failed to fetch"
      //     ? "Gagal meraih server"
      //     : error.message
      //     }`,
      // });

      console.log(error);
    },
  });

  return (
    <SafeAreaView>
      <YStack h="100%" d="flex" jc="center" px={20}>
        <Card elevate>
          <Card.Header>
            <YStack>
              <YStack>
                <H3>Sebelum Mengerjakan,</H3>

                <Text>
                  Pastikan identitas anda sudah benar dan sesuai dengan yang
                  tertera pada kartu ujian.
                </Text>
              </YStack>

              <YStack>
                {studentQuery.isError ? (
                  <></>
                ) : (
                  <>{studentQuery.isLoading ? <Spinner /> : <></>}</>
                )}
              </YStack>
            </YStack>
          </Card.Header>
          <Card.Footer
            px={15}
            pb={20}
            width="100%"
            d="flex"
            fd="col"
            gap={10}
          ></Card.Footer>
        </Card>
      </YStack>
    </SafeAreaView>
  );
};

export default Index;
