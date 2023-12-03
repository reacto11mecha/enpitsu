import Link from "next/link"

import { cn } from "@/lib/utils"

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
                className="text-base font-medium transition-colors hover:text-primary"
            >
                Beranda
            </Link>
            <Link
                href="/admin/angkatan"
                className="text-base font-medium transition-colors hover:text-primary"
            >
                Angkatan
            </Link>
            <Link
                href="/admin/soal"
                className="text-base font-medium transition-colors hover:text-primary"
            >
                Soal
            </Link>
        </nav>
    )
}