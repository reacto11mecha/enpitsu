import { Slot } from "expo-router";
import { useAtom } from "jotai";

import { FirstTimeNoToken } from "~/components/insert-token";
import { studentTokenAtom } from "~/lib/atom";

export default function HomeLayout() {
  const [userToken] = useAtom(studentTokenAtom);

  if (!userToken.token || userToken.token === "") return <FirstTimeNoToken />;

  return <Slot />;
}
