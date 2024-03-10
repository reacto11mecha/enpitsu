import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { studentTokenAtom } from "@/lib/atom";
import { useAtom } from "jotai";
import { RefreshCw } from "lucide-react";

import App from "./App";

import "@fontsource/space-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";

const SetToken = lazy(() => import("@/components/set-token"));

export default function Provider() {
  const [studentAtom] = useAtom(studentTokenAtom);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {studentAtom === "" ? (
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center">
              <RefreshCw size={35} className="animate-spin" />
            </div>
          }
        >
          <SetToken init />
        </Suspense>
      ) : (
        <App />
      )}
      <Toaster />
    </ThemeProvider>
  );
}
