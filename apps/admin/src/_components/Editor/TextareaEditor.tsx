/* eslint-disable @typescript-eslint/no-base-to-string */
"use client";

import { useEffect, useRef, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

interface CollaborativeTextareaProps {
  username: string;
  roomName: string;
  cursorColor: string;
}

export function TextareaEditor({
  username,
  roomName,
  cursorColor,
}: CollaborativeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [connectionStatus, setConnectionStatus] = useState<
    "menghubungkan" | "terhubung" | "terputus"
  >("menghubungkan");
  const [isSynced, setIsSynced] = useState<boolean>(false);

  const yDocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();

    const provider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomName,
      document: doc,

      onConnect: () => {
        setConnectionStatus("terhubung");
      },
      onDisconnect: () => {
        setConnectionStatus("terputus");
      },
      onClose: () => {
        setConnectionStatus("terputus");
      },
      onSynced: ({ state }) => {
        setIsSynced(state);
      },
    });
    const persistence = new IndexeddbPersistence(roomName, doc);

    const yText = doc.getText("essay-answer");

    provider.awareness?.setLocalStateField("user", {
      name: username,
      color: cursorColor,
    });

    const handleInput = (event: Event) => {
      const target = event.target as HTMLTextAreaElement;
      const currentText = yText.toString();
      const newText = target.value;

      if (currentText === newText) {
        return; // No change, probably an update from a remote peer
      }

      // Basic diffing to find where the text changed
      let start = 0;
      while (
        start < currentText.length &&
        start < newText.length &&
        currentText[start] === newText[start]
      ) {
        start++;
      }
      let endCurrent = currentText.length;
      let endNew = newText.length;
      while (
        endCurrent > start &&
        endNew > start &&
        currentText[endCurrent - 1] === newText[endNew - 1]
      ) {
        endCurrent--;
        endNew--;
      }

      const deletedLength = endCurrent - start;
      const insertedText = newText.substring(start, endNew);

      doc.transact(() => {
        if (deletedLength > 0) {
          yText.delete(start, deletedLength);
        }
        if (insertedText.length > 0) {
          yText.insert(start, insertedText);
        }
      });
    };

    const observeYText = () => {
      if (textareaRef.current) {
        textareaRef.current.value = yText.toString();
      }
    };
    yText.observe(observeYText);

    const textareaEl = textareaRef.current;
    if (textareaEl) {
      // Set initial value
      textareaEl.value = yText.toString();
      textareaEl.addEventListener("input", handleInput);
    }

    // Store instances in refs for cleanup
    yDocRef.current = doc;
    providerRef.current = provider;
    persistenceRef.current = persistence;
    yTextRef.current = yText;

    return () => {
      // Disconnect from the Hocuspocus server
      provider.disconnect();

      // Destroy the document instance
      doc.destroy();

      // Clean up the input event listener
      if (textareaEl) {
        textareaEl.removeEventListener("input", handleInput);
      }

      // Unobserve the Y.Text type
      yText.unobserve(observeYText);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]); // Re-run effect only if roomName changes

  // Effect to update user info if it changes without full reconnect
  useEffect(() => {
    if (providerRef.current?.awareness) {
      providerRef.current.awareness.setLocalStateField("user", {
        name: username,
        color: cursorColor,
      });
    }
  }, [username, cursorColor]);

  // --- Render the component UI ---
  return (
    <div className="mx-auto w-full space-y-3 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <p className="text-lg">Jawaban essay</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                connectionStatus === "terhubung"
                  ? "bg-green-500"
                  : connectionStatus === "menghubungkan"
                    ? "animate-pulse bg-yellow-500"
                    : "bg-red-500"
              }`}
            ></span>
            <span>
              {connectionStatus.charAt(0).toUpperCase() +
                connectionStatus.slice(1)}
            </span>
          </div>
          <span className="text-slate-500">|</span>
          <span>{isSynced ? "Sinkron" : "Sinkronisasi..."}</span>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        disabled={!isSynced}
        className="w-full resize-y rounded-md p-4 font-mono transition-all focus:ring-2 focus:ring-green-500 focus:outline-none"
        placeholder="Tambahakan jawaban essay disini..."
      />
    </div>
  );
}
