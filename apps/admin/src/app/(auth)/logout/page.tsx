import { signOut } from "@enpitsu/auth";
import { Button } from "@enpitsu/ui/button";

export default function LogoutPage() {
  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center p-10">
      <div className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center gap-5 md:gap-10">
        <h1 className="text-2xl font-bold md:text-4xl">Mau LogOut?</h1>
        <h2 className="font-regular text-center text-xl md:text-3xl">
          Masih bisa LogIn lagi kok
        </h2>
      </div>

      <form
        className="w-full"
        action={async () => {
          "use server";

          await signOut();
        }}
      >
        <Button className="w-full md:text-lg">Keluar</Button>
      </form>
    </div>
  );
}
