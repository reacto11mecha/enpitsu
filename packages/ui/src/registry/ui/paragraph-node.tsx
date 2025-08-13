"use client";

import type { PlateElementProps } from "platejs/react";
import * as React from "react";
import { PlateElement } from "platejs/react";

import { cn } from "../../index";

export function ParagraphElement(props: PlateElementProps) {
  return (
    <PlateElement {...props} className={cn("m-0 px-0 py-1")}>
      {props.children}
    </PlateElement>
  );
}
