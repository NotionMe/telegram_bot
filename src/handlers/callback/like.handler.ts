import { Bot, CallbackQueryContext } from "gramio";
import { IVoteService } from "../../interfaces/vote-service.interface";
import { likeData } from "../../shared/callback-data";
import { ICallbackHandler } from "../../interfaces/callback-handler.interface";

export class LikeCallbackHandler implements ICallbackHandler {
  readonly callbackData = "like";

  constructor(private voteService: IVoteService) {}

  canHandle(ctx: CallbackQueryContext<Bot>): boolean {
    try {
      likeData.unpack(ctx.data);
      return true;
    } catch {
      return false;
    }
  }

  async handle(ctx: CallbackQueryContext<Bot>): Promise<void> {
    const { messageId } = likeData.unpack(ctx.data);
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.answer("Помилка: не знайдено користувача");
      return;
    }

    const result = await this.voteService.addVote(messageId, userId, "like");
    await ctx.answer(`Лайків: ${result.likes}, Дізлайків: ${result.dislikes}`);
  }
}
