import type { SlateElementProps } from "platejs";
import * as React from "react";
import { cn } from "@/lib/utils";
import { SlateElement } from "platejs";

export function ParagraphElementStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props} className={cn("m-0 px-0 py-1 text-balance")}>
      {props.children}
    </SlateElement>
  );
}
