import { Slot } from "expo-router";
import { useAtom } from "jotai";

import { InsertToken } from "~/components/insert-token";
import { studentTokenAtom } from "~/lib/atom";

export default function HomeLayout() {
  const [token] = useAtom(studentTokenAtom);

  if (token === "") return <InsertToken />;

  return <Slot />;
}
