import Link from "next/link";
import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/admin"
        className="hover:text-primary text-base font-medium transition-colors"
      >
        Beranda
      </Link>
      <Link
        href="/admin/angkatan"
        className="hover:text-primary text-base font-medium transition-colors"
      >
        Angkatan
      </Link>
      <Link
        href="/admin/soal"
        className="hover:text-primary text-base font-medium transition-colors"
      >
        Soal
      </Link>
    </nav>
  );
}
