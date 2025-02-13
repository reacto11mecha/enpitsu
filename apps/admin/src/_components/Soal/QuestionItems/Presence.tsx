"use client";

import type { WebsocketProvider } from "y-websocket";
import { memo, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@enpitsu/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@enpitsu/ui/tooltip";

interface UserAwareness {
  name: string;
  color: string;
  image: string;
}

export const Presence = memo(function Presence({
  awareness,
}: {
  awareness: WebsocketProvider["awareness"];
}) {
  const [anotherJoinedUsers, setAnotherUsers] = useState<UserAwareness[]>([]);

  useEffect(() => {
    const evtCallback = () => {
      const copiedMap = new Map<number, { user: UserAwareness }>(
        // @ts-expect-error udah biarin aja ini mah (famous last word)
        awareness.getStates(),
      );
      copiedMap.delete(awareness.clientID);

      if (copiedMap.size === 0) {
        setAnotherUsers([]);

        return;
      }

      const myself = awareness.getLocalState() as unknown as {
        user: UserAwareness;
      } | null;

      if (!myself) return;

      const newData = Array.from(copiedMap)
        .map(([_, d]) => d.user)
        .filter((user) => myself.user.image !== user.image);
      const removeDuplicate = Array.from(new Set(newData.map((nd) => nd.image)))
        .map((img) => newData.find((d) => d.image === img))
        .filter((d) => !!d) satisfies UserAwareness[];

      setAnotherUsers(removeDuplicate);
    };

    awareness.on("change", evtCallback);

    return () => {
      awareness.off("change", evtCallback);
    };
  }, [awareness]);

  return (
    <div className="w-full md:fixed md:bottom-2 md:right-2 md:w-fit">
      {anotherJoinedUsers.length > 0 ? (
        <>
          <h3 className="mb-2.5 scroll-m-20 text-xl font-semibold tracking-tight md:hidden">
            Pengguna yang aktif
          </h3>
          <div className="mb-2 grid grid-flow-col grid-cols-10 gap-1.5 md:flex md:max-h-[45vh] md:flex-col md:items-center md:justify-center md:overflow-y-auto">
            <TooltipProvider>
              {anotherJoinedUsers.map((user) => (
                <Tooltip key={user.image}>
                  <TooltipTrigger>
                    <Avatar
                      className="border"
                      style={{ borderColor: user.color }}
                    >
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="uppercase">
                        {user.name ? user.name.slice(0, 2) : "N/A"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </>
      ) : null}
    </div>
  );
});
