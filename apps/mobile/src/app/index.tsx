import React from "react";
import { SafeAreaView } from "react-native";
import { useAtom } from "jotai";
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

import { InsertToken } from "~/components/insert-token";
import { api } from "~/lib/api";
import { studentTokenAtom } from "~/lib/atom";

const ActualIndex = () => {
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

const Index = () => {
  const [token] = useAtom(studentTokenAtom);

  if (token === "") return <InsertToken />;

  return <ActualIndex />;
};

export default Index;
