import { eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";
import * as Y from "yjs";

import type { WSSharedDoc } from "./utils";

const convertToId = (doc: string) => Number(doc.replace("question-", ""));

export const postgresPersistence = {
  provider: db,
  bindState: async (docName: string, ydoc: WSSharedDoc): Promise<void> => {
    const documentId = convertToId(docName);
    // Attempt to retrieve the persisted state from the database.
    const result = await db.query.questions.findFirst({
      where: eq(schema.questions.id, documentId),
    });

    if (result) {
      const persistedState = result.docState;

      // Apply the persisted update to the Yjs document.
      if (persistedState !== null) Y.applyUpdate(ydoc, persistedState);
    } else {
      return;
    }

    // Listen for document updates and persist them.
    ydoc.on("update", async (update: Uint8Array) => {
      // Compute the current full state.
      const newState = Y.encodeStateAsUpdate(ydoc);

      await db
        .update(schema.questions)
        .set({ docState: Buffer.from(newState) })
        .where(eq(schema.questions.id, documentId));
    });
  },

  writeState: async (docName: string, ydoc: WSSharedDoc): Promise<void> => {
    // This method can be used when the document is closed.
    const newState = Y.encodeStateAsUpdate(ydoc);

    await db
      .update(schema.questions)
      .set({ docState: Buffer.from(newState) })
      .where(eq(schema.questions.id, convertToId(docName)));
  },
};
