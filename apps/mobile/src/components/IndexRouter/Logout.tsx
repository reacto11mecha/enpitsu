import { LogOut } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";

import { studentAnswerAtom, studentTokenAtom } from "~/lib/atom";

export const Logout = () => {
  const [, setToken] = useAtom(studentTokenAtom);
  const [, setAnswers] = useAtom(studentAnswerAtom);

  return <></>;
};
