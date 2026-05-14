import { BaseIndentKit } from "@/components/editor/plugins/indent-base-kit";
import { BlockListStatic } from "@/components/ui/block-list-static";
import { BaseListPlugin } from "@platejs/list";
import { KEYS } from "platejs";

export const BaseListKit = [
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ...BaseIndentKit,
  BaseListPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
      ],
    },
    render: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      belowNodes: BlockListStatic,
    },
  }),
];
