import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

import { auth, signIn } from "@enpitsu/auth";
import { settings } from "@enpitsu/settings";

import { Button } from "~/components/ui/button";

export const fetchCache = "force-no-store";

export default async function LoginPage() {
  const session = await auth();

  const { canLogin } = settings.getSettings();

  if (!session) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-24 bg-gray-100">
        {canLogin ? (
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <Button className="flex flex-row items-center gap-5 rounded-full px-10 py-7 text-lg font-semibold no-underline transition">
              <FcGoogle className="text-2xl" />
              Log In menggunakan Google
            </Button>
          </form>
        ) : (
          <h1 className="scroll-m-20 text-center text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Akses masuk ditolak.
          </h1>
        )}
      </main>
    );
  }

  redirect("/admin");
}
