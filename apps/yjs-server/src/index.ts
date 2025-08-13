// import type { onLoadDocumentPayload } from "@hocuspocus/server";
// import { Logger } from "@hocuspocus/extension-logger";
// import { Server } from "@hocuspocus/server";

// import { slateNodesToInsertDelta } from "@slate-yjs/core";
// import * as Y from "yjs";

// import { env } from "./env";
// import { initLogger } from "./logger";

// export const yjsServer = async (loggerDirectory: string) => {
export const yjsServer = () => {
  console.log("Future implementation!");
  // // const logger = initLogger(loggerDirectory);

  // // const initialValue = [{ type: "paragraph", children: [{ text: "" }] }];

  // // Setup the server
  // const server = new Server({
  //   port: 1234,

  //   // Add logging
  //   extensions: [new Logger()],

  //   // onLoadDocument(data: onLoadDocumentPayload) {
  //   //   // Load the initial value in case the document is empty
  //   //   if (data.document.isEmpty("content")) {
  //   //     const insertDelta = slateNodesToInsertDelta(initialValue);
  //   //     const sharedRoot = data.document.get("content", Y.XmlText);
  //   //     sharedRoot.applyDelta(insertDelta);
  //   //   }

  //   //   return data;
  //   // },
  // });

  // await server.listen();
};
