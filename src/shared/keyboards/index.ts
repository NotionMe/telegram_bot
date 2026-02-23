import { InlineKeyboard } from "gramio";
import { likeData, dislikeData } from "../callback-data";

export function createVideoKeyboard(messageId: number) {
  return new InlineKeyboard()
    .text("👍", likeData.pack({ messageId }))
    .text("👎", dislikeData.pack({ messageId }));
}
