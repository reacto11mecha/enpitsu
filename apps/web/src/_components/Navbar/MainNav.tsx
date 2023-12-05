import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/admin",
    label: "Admin",
  },
  {
    href: "/admin/angkatan",
    label: "Angkatan",
  },
  {
    href: "/admin/soal",
    label: "Soal",
  },
];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="hover:text-primary text-base font-medium transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
