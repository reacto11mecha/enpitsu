import { useRouter } from "expo-router";
import { validateId } from "@enpitsu/token-generator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/lib/api";
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

export const FirstTimeNoToken = () => {
  const [userToken, setToken] = useAtom(studentTokenAtom);

  const {
    control: _c,
    // handleSubmit,
    // formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: userToken.token,
    },
  });

  const _onSubmit = (values: z.infer<typeof formSchema>) =>
    setToken({ ...values });

  return <></>;
};

export const Settings = () => {
  const [userToken, setToken] = useAtom(studentTokenAtom);

  const router = useRouter();
  const apiUtils = api.useUtils();

  const {
    control: _c,
    // handleSubmit,
    // formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: userToken.token,
    },
  });

  const _onSubmit = async (values: z.infer<typeof formSchema>) => {
    await setToken({ ...values });

    router.replace("/");

    await apiUtils.exam.getStudent.invalidate();
  };

  return <></>;
};
