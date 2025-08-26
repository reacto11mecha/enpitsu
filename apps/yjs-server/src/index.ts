// import type { onLoadDocumentPayload } from "@hocuspocus/server";
import { eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";

// import { slateNodesToInsertDelta } from "@slate-yjs/core";
// import * as Y from "yjs";

// import { env } from "./env";
// import { initLogger } from "./logger";

// export const yjsServer = async (loggerDirectory: string) => {
export const yjsServer = async () => {
  const server = new Server({
    port: 1234,

    // Add logging
    extensions: [
      new Logger(),
      new Database({
        fetch: async ({ documentName }) => {
          const result = await db.query.yjsDocuments.findFirst({
            where: eq(schema.yjsDocuments.name, documentName),
          });

          if (!result) return null;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return result.data;
        },

        store: async ({ documentName, state }) => {
          await db
            .insert(schema.yjsDocuments)
            .values({ name: documentName, data: state })
            .onConflictDoUpdate({
              target: schema.yjsDocuments.name,
              set: { data: state },
            });
        },
      }),
    ],

    async onAuthenticate(data) {
      const cookie = data.requestHeaders.cookie;

      const cookies = (
        cookie !== ""
          ? Object.fromEntries(
              cookie!
                .split("; ")
                .map((v) => v.split(/=(.*)/s).map(decodeURIComponent)),
            )
          : {}
      ) as { "authjs.session-token"?: string };

      if (
        !cookies["authjs.session-token"] ||
        cookies["authjs.session-token"] === ""
      )
        throw new Error("Unauthorized");

      const token = cookies["authjs.session-token"];

      if (
        !(await db.query.sessions.findFirst({
          where: eq(schema.sessions.sessionToken, token),
        }))
      )
        throw new Error("You aint logged in bruv");
    },
  });

  await server.listen();
};
