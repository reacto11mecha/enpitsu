import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { api } from "~/lib/api";
// import { Precaution } from "./Precaution";
// import { ScannerWrapper } from "./Scanner";
import { formSchema } from "./schema";

export const ScanOrInputQuestionSlug = (_k: { closeScanner: () => void }) => {
  // const toast = useToastController();

  const [_isPrecautionOpen, setOpen] = useState(false);

  const getQuestionMutation = api.exam.getQuestion.useMutation({
    onSuccess() {
      setOpen(true);
    },
    onError(_error) {
      // toast.show("Gagal mengerjakan soal", {
      //   message:
      //     error.message === "Failed to fetch"
      //       ? "Gagal meraih server"
      //       : error.message,
      // });
    },
  });

  const _closePrecaution = useCallback(() => setOpen(false), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  });

  const _sendMutate = useCallback(
    (slug: string) => {
      form.setValue("slug", slug);

      getQuestionMutation.mutate({ slug });
    },
    [form, getQuestionMutation],
  );

  const _onSubmit = (values: z.infer<typeof formSchema>) =>
    getQuestionMutation.mutate(values);

  return <SafeAreaView></SafeAreaView>;
};
