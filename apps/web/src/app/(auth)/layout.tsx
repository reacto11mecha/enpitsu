import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@enpitsu/auth";


import "~/styles/globals.css";

import { headers } from "next/headers";

import { TRPCReactProvider } from "./providers";
import { Navbar } from "~/_components/Navbar";

export const metadata: Metadata = {
  title: "enpitsu | Dasbor Admin",
};

export default async function Layout(props: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) return redirect("/login");

  return (
    <html lang="en">
      <body>
        <TRPCReactProvider headers={headers()}>
          <Navbar user={session.user} />
          {props.children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
