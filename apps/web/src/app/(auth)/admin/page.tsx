// import { } from "@enpitsu/ui/@/components/ui/popover"

import { cn } from '@enpitsu/ui/@/lib/utils';
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    "use client";

    const pathname = usePathname()

    const routes = [
        {
            href: `/ad`,
            label: "Apapaun",
            active: pathname.startsWith("/ad")
        }
    ];

    return (
        <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "text-sn font-medium transition-colors hover: text-primary", route.active
                        ? "text-black dark:text-white"
                        : "text-muted-foreground"
                    )}
                >
                    {route.label}
                </Link >
            ))}
        </nav >
    );
}


const Navbar = () => {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <MainNav />
            </div>
        </div>
    )
}

export default function AdminPage() {
    return (<>
        <Navbar />
    </>)
}