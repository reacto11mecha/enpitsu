import type { Metadata } from "next";
import { Manrope as FontSans } from "next/font/google";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@enpitsu/auth";

import "~/styles/globals.css";

import localFont from "next/font/local";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import { Navbar } from "~/_components/Navbar";
import { ThemeProvider } from "~/_components/theme-provider";
import { TRPCReactProvider } from "./providers";

const QuranFont = localFont({
  src: "../../fonts/LPMQ-IsepMisbah.ttf",
  variable: "--font-lpmq-isepmisbah",
});

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

  if (!session.user.emailVerified)
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
            <div className="flex h-screen flex-col items-center justify-center p-2">
              <h2 className="scroll-m-20 pb-2 text-center text-3xl font-semibold tracking-tight first:mt-0">
                Anda Belum Terverifikasi
              </h2>
              <p className="text-center leading-7 sm:w-[95%] md:w-[50%] [&:not(:first-child)]:mt-6">
                Anda belum terverifikasi oleh tim IT, mohon hubungi orang yang
                bersangkutan supaya anda bisa mengakses dashboard admin. Jika
                ini sudah terverifikasi maka refresh halaman ini atau keluar dan
                login kembali.
              </p>

              <form
                className="mt-5 flex w-full justify-center"
                action={async () => {
                  "use server";

                  await signOut();
                }}
              >
                <Button variant="outline" className="md:text-lg">
                  Keluar
                </Button>
              </form>
            </div>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    );

  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
          QuranFont.variable,
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
