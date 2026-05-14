import type { Metadata } from "next";
import { Manrope as FontSans } from "next/font/google";

import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "enpitsu | CBT Software",
  description: "Aplikasi ujian online berbasis web dan mobile apps",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="ID-id" suppressHydrationWarning>
      <body className={fontSans.className}>{props.children}</body>
    </html>
  );
}
