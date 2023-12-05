import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@enpitsu/auth";
import { FcGoogle } from "react-icons/fc";

export default async function LoginPage() {
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
