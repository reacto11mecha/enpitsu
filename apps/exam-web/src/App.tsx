import { ThemeProvider } from "@/components/theme-provider";
import { usePageVisibility } from "@/hooks/usePageVisibility";

import { ModeToggle } from "./components/mode-toggle";

export default function App() {
  const { isPageVisible } = usePageVisibility();

  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <div>
        <h1 className="text-5xl">What</h1>
        <p>Fokus? {isPageVisible ? "Iya" : "Nggak"}</p>

        <ModeToggle />
      </div>
    </ThemeProvider>
  );
}
