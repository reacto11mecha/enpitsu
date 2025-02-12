import http from "http";
import { parseInt as parseIntUtil } from "lib0/number";

import { WSSharedDoc } from "./utils";

const CALLBACK_URL: URL | null = process.env.CALLBACK_URL
  ? new URL(process.env.CALLBACK_URL)
  : null;
const CALLBACK_TIMEOUT: number = parseIntUtil(
  process.env.CALLBACK_TIMEOUT || "5000",
);
const CALLBACK_OBJECTS: { [key: string]: string } = process.env.CALLBACK_OBJECTS
  ? JSON.parse(process.env.CALLBACK_OBJECTS)
  : {};

/** Flag indicating if callback functionality is enabled */
export const isCallbackSet = !!CALLBACK_URL;

/**
 * Handler that is called (debounced) on document updates.
 *
 * @param update - The Yjs update as Uint8Array.
 * @param origin - The origin of the update.
 * @param doc - The Yjs document.
 */
export const callbackHandler = (
  update: Uint8Array,
  origin: any,
  doc: WSSharedDoc,
): void => {
  const room = doc.name;
  const dataToSend: {
    room: string;
    data: { [key: string]: { type: string; content: any } };
  } = {
    room,
    data: {},
  };
  const sharedObjectList = Object.keys(CALLBACK_OBJECTS);
  sharedObjectList.forEach((sharedObjectName) => {
    const sharedObjectType = CALLBACK_OBJECTS[sharedObjectName];
    dataToSend.data[sharedObjectName] = {
      type: sharedObjectType as string,
      content: getContent(sharedObjectName, sharedObjectType as string, doc)
        // @ts-expect-error ini biarin dulu
        .toJSON(),
    };
  });
  if (CALLBACK_URL) {
    callbackRequest(CALLBACK_URL, CALLBACK_TIMEOUT, dataToSend);
  }
};

/**
 * Sends an HTTP POST request to the callback URL with the update data.
 *
 * @param url - The callback URL.
 * @param timeout - Request timeout in milliseconds.
 * @param data - The data to send.
 */
const callbackRequest = (url: URL, timeout: number, data: object): void => {
  const dataString = JSON.stringify(data);
  const options: http.RequestOptions = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    timeout,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(dataString),
    },
  };
  const req = http.request(options);
  req.on("timeout", () => {
    console.warn("Callback request timed out.");
    req.abort();
  });
  req.on("error", (e) => {
    console.error("Callback request error.", e);
    req.abort();
  });
  req.write(dataString);
  req.end();
};

/**
 * Retrieves the content of a shared object from the Yjs document.
 *
 * @param objName - The name of the shared object.
 * @param objType - The type of the shared object (e.g. 'Array', 'Map', 'Text', etc.).
 * @param doc - The Yjs document.
 * @returns The shared object.
 */
const getContent = (objName: string, objType: string, doc: WSSharedDoc) => {
  switch (objType) {
    case "Array":
      return doc.getArray(objName);
    case "Map":
      return doc.getMap(objName);
    case "Text":
      return doc.getText(objName);
    case "XmlFragment":
      return doc.getXmlFragment(objName);
    case "XmlElement":
      return doc.getXmlElement(objName);
    default:
      return {};
  }
};
