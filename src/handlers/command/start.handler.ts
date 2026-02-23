import { Bot, MessageContext } from "gramio";
import { ICommandHandler } from "../../interfaces/command-handler.interface";

export class StartCommandHandler implements ICommandHandler {
  readonly command = "start";

  async handle(ctx: MessageContext<Bot>): Promise<void> {
    await ctx.reply("Привіт! Надішли мені посилання на TikTok відео або використай команду /tiktok <url>");
  }
}
