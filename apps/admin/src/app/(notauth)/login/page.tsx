import { cache as ReactCache } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@enpitsu/auth";
import { cache } from "@enpitsu/cache";
import { FcGoogle } from "react-icons/fc";

// Check every 30 sec
export const revalidate = 40;

const getStatus = ReactCache(async () => {
  try {
    const status = await cache.get("login-status");

    // This is true because it actually a success connection
    return status ? (JSON.parse(status) as boolean) : true;
  } catch (_) {
    // Need to be false because you need to check the status of the redis instance
    return false;
  }
});

export default async function LoginPage() {
  const isAllowed = await getStatus();

  if (!isAllowed) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-24 bg-gray-100">
        <h1 className="scroll-m-20 text-center text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Akses masuk ditolak.
        </h1>
      </main>
    );
  }

  const session = await auth();

  if (!session) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-24 bg-gray-100">
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
      </main>
    );
  }

  redirect("/admin");
}
