import { useTheme } from "@/components/theme-provider";
import { Button } from "@enpitsu/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@enpitsu/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";

export function ModeToggle({
  size,
}: {
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size ?? "icon"}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Ganti tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Terang
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Gelap
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Sistem
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
