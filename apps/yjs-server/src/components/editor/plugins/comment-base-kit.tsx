import { CommentLeafStatic } from "@/components/ui/comment-node-static";
import { BaseCommentPlugin } from "@platejs/comment";

export const BaseCommentKit = [
  BaseCommentPlugin.withComponent(CommentLeafStatic),
];
