import { Bot, MessageContext } from "gramio";

export interface ICommandHandler {
  readonly command: string;
  handle(ctx: MessageContext<Bot>): Promise<void>;
}
