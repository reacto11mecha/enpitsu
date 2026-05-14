import type { SlateElementProps } from "platejs";
import * as React from "react";
import { cn } from "@/lib/utils";
import { SlateElement } from "platejs";

export function HrElementStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr
          className={cn(
            "bg-muted h-0.5 rounded-sm border-none bg-clip-content",
          )}
        />
      </div>
      {props.children}
    </SlateElement>
  );
}
