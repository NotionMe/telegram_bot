import { CallbackData } from "gramio";

export const likeData = new CallbackData("like").number("messageId");
export const dislikeData = new CallbackData("dislike").number("messageId");
