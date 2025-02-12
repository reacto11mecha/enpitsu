#!/usr/bin/env node
import http from "http";
import { parseInt as parseIntUtil } from "lib0/number";
import { WebSocketServer } from "ws";

import { setupWSConnection } from "./utils";

const host: string = process.env.HOST || "localhost";
const port: number = parseIntUtil(process.env.PORT || "1234");

const server = http.createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", setupWSConnection);

server.on("upgrade", (request, socket, head) => {
  // Optionally: Check authentication or other request data here.
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`);
});
