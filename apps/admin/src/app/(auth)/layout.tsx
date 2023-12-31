import type { Metadata } from "next";
import { Manrope as FontSans } from "next/font/google";
import { redirect } from "next/navigation";
import { auth } from "@enpitsu/auth";

import "~/styles/globals.css";

import { headers } from "next/headers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import { Navbar } from "~/_components/Navbar";
import { ThemeProvider } from "~/_components/theme-provider";
import { TRPCReactProvider } from "./providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "enpitsu | Dasbor Admin",
};

export default async function Layout(props: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) return redirect("/login");

  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider headers={headers()}>
            <Navbar user={session.user} />
            {props.children}
          </TRPCReactProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
