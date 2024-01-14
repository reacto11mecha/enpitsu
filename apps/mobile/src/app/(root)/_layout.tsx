import { Slot } from "expo-router";
import { useAtom } from "jotai";

import { FirstTimeNoToken } from "~/components/insert-token";
import { studentTokenAtom } from "~/lib/atom";

export default function HomeLayout() {
  const [token] = useAtom(studentTokenAtom);

  if (token === "") return <FirstTimeNoToken />;

  return <Slot />;
}
