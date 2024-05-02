import { Pressable } from "react-native";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { LogOut } from "lucide-react-native";

import { studentAnswerAtom, studentTokenAtom } from "~/lib/atom";

export const Logout = () => {
  const setToken = useSetAtom(studentTokenAtom);
  const setAnswers = useSetAtom(studentAnswerAtom);

  return (
    <Pressable
      className="flex w-[10%] items-center justify-center rounded-lg bg-transparent dark:bg-stone-200"
      onPress={() => {
        setToken(RESET);
        setAnswers(RESET);
      }}
    >
      <LogOut color="#0c0a09" size={19} />
    </Pressable>
  );
};
