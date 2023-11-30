import { auth, signIn } from "@enpitsu/auth";
import { redirect } from "next/navigation";

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
                <button className="text-lg rounded-full px-10 py-3 font-semibold no-underline transition bg-slate-500/20 hover:bg-slate-400 text-slate-900 flex flex-row gap-5 items-center">
                    <FcGoogle className="text-2xl" />Log In menggunakan Google
                </button>
            </form>
        );
    }

    redirect('/somewherelse')
}