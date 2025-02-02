"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@enpitsu/ui/skeleton";

export function LoginGuard({ children }: { children: React.ReactNode }) {
  const [canLogin, setLogin] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/canLogin")
      .then((res) => res.json())
      .then((data: { canLogin: boolean }) => {
        setLogin(data.canLogin);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-[4em] w-[60%] rounded bg-gray-300" />
      ) : (
        <>
          {canLogin ? (
            <>{children}</>
          ) : (
            <h1 className="scroll-m-20 text-center text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              Akses masuk ditolak.
            </h1>
          )}
        </>
      )}
    </>
  );
}
