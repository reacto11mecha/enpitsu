"use dom";

import React from "react";

export default function HtmlContent({
  html,
  color,
  fontSize,
}: {
  html: string;
  color: string;
  fontSize: number;
  dom: import("expo/dom").DOMProps;
}) {
  return (
    <div
      style={{
        color,
        fontSize: `${fontSize}px`,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        lineHeight: "1.5",
        maxWidth: "100%",
        overflowWrap: "break-word",
        // PENTING: Reset margin/padding agar perhitungan tinggi akurat
        margin: 0,
        padding: 0,
        display: "block", // Pastikan block element
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
