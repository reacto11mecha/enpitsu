import type { Metadata } from "next";

import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "enpitsu | CBT Software",
  description: "Aplikasi ujian online berbasis web dan mobile apps",
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="flex h-screen flex-col items-center justify-center gap-24 bg-gray-100">
          {props.children}
        </main>
      </body>
    </html>
  );
}
