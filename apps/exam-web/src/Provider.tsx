import { SetToken } from "@/components/set-token";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { studentTokenAtom } from "@/lib/atom";
import { useAtom } from "jotai";

import App from "./App";

export default function Provider() {
  const [studentAtom] = useAtom(studentTokenAtom);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {studentAtom === "" ? <SetToken init /> : <App />}
      <Toaster />
    </ThemeProvider>
  );
}
