import { AllRegisteredUser } from "~/_components/Admin/AllRegisteredUser/index";
import { PendingUser } from "~/_components/Admin/PendingUser/index";
import { ToggleCanLogin } from "~/_components/Admin/ToggleCanLogin";

export default function AdminPage() {
  return (
    <div className="mt-5 flex flex-col gap-7 px-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Beranda Admin</h2>
        <p className="text-muted-foreground">
          Kelola semua pengguna dan perilaku pengguna pada halaman ini.
        </p>
      </div>

      <ToggleCanLogin />

      <div className="flex flex-col gap-3">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Seluruh Pengguna
        </h4>

        <AllRegisteredUser />
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Menunggu Persetujuan
        </h4>

        <PendingUser />
      </div>
    </div>
  );
}
