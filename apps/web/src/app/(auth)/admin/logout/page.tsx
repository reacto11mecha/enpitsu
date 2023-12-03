
import { signOut } from "@enpitsu/auth";

export default function LogoutPage() {
  return (
    <div className=" flex flex-col items-center justify-center">
      <h1>Ingin logout?</h1>

      <form
        action={async () => {
          "use server"

          await signOut();
        }}
      >
        <button>
          Keluar
        </button>
      </form >
    </div>
  );
}
