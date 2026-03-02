"use dom";

import React, { useEffect } from "react";

import "./compiled-globals.css";
import "katex";

export default function HtmlContent({
  html,
  color,
  theme = "light",
  fontSize,
}: {
  html: string;
  color: string;
  theme: "light" | "dark";
  fontSize: number;
  dom: import("expo/dom").DOMProps;
}) {
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const hljsThemeUrl =
    theme === "dark"
      ? "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css"
      : "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css";

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
        crossOrigin="anonymous"
      />

      <link rel="stylesheet" href={hljsThemeUrl} crossOrigin="anonymous" />

      <div
        style={{
          color,
          fontSize: `${fontSize}px`,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          lineHeight: "1.5",
          maxWidth: "100%",
          overflowWrap: "break-word",
          margin: 0,
          padding: 0,
          display: "block",
          userSelect: "none",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
