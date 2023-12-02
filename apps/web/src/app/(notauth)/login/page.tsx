import { redirect } from "next/navigation";
import { auth, signIn } from "@enpitsu/auth";
import { FcGoogle } from "react-icons/fc";

export default async function LoginPage() {
  const session = await auth();

  if (!session) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button className="flex flex-row items-center gap-5 rounded-full bg-slate-500/20 px-10 py-3 text-lg font-semibold text-slate-900 no-underline transition hover:bg-slate-400">
          <FcGoogle className="text-2xl" />
          Log In menggunakan Google
        </button>
      </form>
    );
  }

  redirect("/admin");
}
