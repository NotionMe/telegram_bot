import { Bot, CallbackQueryContext } from "gramio";
import { Bot as BotType } from "gramio";
import { IVoteService } from "../../interfaces/vote-service.interface";
import { dislikeData } from "../../shared/callback-data";
import { ICallbackHandler } from "../../interfaces/callback-handler.interface";

export class DislikeCallbackHandler implements ICallbackHandler {
  readonly callbackData = "dislike";

  constructor(
    private voteService: IVoteService,
    private bot: BotType
  ) {}

  canHandle(ctx: CallbackQueryContext<BotType>): boolean {
    try {
      dislikeData.unpack(ctx.data);
      return true;
    } catch {
      return false;
    }
  }

  async handle(ctx: CallbackQueryContext<BotType>): Promise<void> {
    const { messageId } = dislikeData.unpack(ctx.data);
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.answer("Помилка: не знайдено користувача");
      return;
    }

    const result = await this.voteService.addVote(messageId, userId, "dislike");

    if (result.shouldDelete) {
      try {
        const chatId = ctx.chatId;
        if (!chatId) {
          await ctx.answer("Помилка: не знайдено чат");
          return;
        }

        await this.bot.api.deleteMessage({
          chat_id: chatId,
          message_id: messageId,
        });

        await this.voteService.deleteVote(messageId);
        await ctx.answer("Відео видалено (3+ дізлайків)");
        return;
      } catch (error) {
        console.error("Помилка видалення:", error);
      }
    }

    await ctx.answer(`Лайків: ${result.likes}, Дізлайків: ${result.dislikes}`);
  }
}
