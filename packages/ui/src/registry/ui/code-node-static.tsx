import type { SlateLeafProps } from "platejs";
import * as React from "react";
import { SlateLeaf } from "platejs";

export function CodeLeafStatic(props: SlateLeafProps) {
  return (
    <SlateLeaf
      {...props}
      as="code"
      className="font-mono whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] text-sm"
    >
      {props.children}
    </SlateLeaf>
  );
}
