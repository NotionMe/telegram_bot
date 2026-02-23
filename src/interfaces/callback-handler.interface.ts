import { Bot, CallbackQueryContext } from "gramio";

export interface ICallbackHandler {
  readonly callbackData: string;
  canHandle(ctx: CallbackQueryContext<Bot>): boolean;
  handle(ctx: CallbackQueryContext<Bot>): Promise<void>;
}
