import { Bot, MessageContext } from "gramio";

export interface IMessageHandler {
  canHandle(ctx: MessageContext<Bot>): boolean;
  handle(ctx: MessageContext<Bot>): Promise<void>;
}
