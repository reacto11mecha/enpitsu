import {
  EquationElementStatic,
  InlineEquationElementStatic,
} from "@/components/ui/equation-node-static";
import { BaseEquationPlugin, BaseInlineEquationPlugin } from "@platejs/math";

export const BaseMathKit = [
  BaseInlineEquationPlugin.withComponent(InlineEquationElementStatic),
  BaseEquationPlugin.withComponent(EquationElementStatic),
];
