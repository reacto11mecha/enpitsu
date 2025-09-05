import Link from "next/link";

import { cn } from "~/lib/utils";

const links = [
  {
    href: "/admin",
    label: "Admin",
    normalUserAccessible: false,
  },
  {
    href: "/admin/angkatan",
    label: "Angkatan",
    normalUserAccessible: false,
  },
  {
    href: "/admin/soal",
    label: "Soal",
    normalUserAccessible: true,
  },
];

export function MainNav({
  className,
  role,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  role: "admin" | "user";
}) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links
        .filter((link) => (role === "user" ? link.normalUserAccessible : true))
        .map((link) => (
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
