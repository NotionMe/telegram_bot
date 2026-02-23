import { Bot } from "gramio";
import { ICommandHandler } from "../interfaces/command-handler.interface";
import { IMessageHandler } from "../interfaces/message-handler.interface";
import { LikeCallbackHandler } from "../handlers/callback/like.handler";
import { DislikeCallbackHandler } from "../handlers/callback/dislike.handler";

export class BotController {
  constructor(
    private bot: Bot,
    private commandHandlers: ICommandHandler[],
    private messageHandlers: IMessageHandler[],
    private likeHandler: LikeCallbackHandler,
    private dislikeHandler: DislikeCallbackHandler
  ) {}

  registerRoutes(): void {
    for (const handler of this.commandHandlers) {
      this.bot.command(handler.command, (ctx) => handler.handle(ctx));
    }

    this.bot.on("message", async (ctx) => {
      for (const handler of this.messageHandlers) {
        if (handler.canHandle(ctx)) {
          await handler.handle(ctx);
          return;
        }
      }
    });

    this.bot.on("callback_query", async (ctx) => {
      if (this.likeHandler.canHandle(ctx)) {
        await this.likeHandler.handle(ctx);
        return;
      }

      if (this.dislikeHandler.canHandle(ctx)) {
        await this.dislikeHandler.handle(ctx);
        return;
      }
    });
  }

  async start(): Promise<void> {
    await this.bot.start();
    console.log("🤖 TikTok Бот успішно запущений!");
  }

  async stop(): Promise<void> {
    await this.bot.stop();
  }
}
