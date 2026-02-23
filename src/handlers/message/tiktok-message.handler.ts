import { readFile, unlink } from "fs/promises";
import { Bot, MediaUpload, MessageContext } from "gramio";
import { IMemoryService } from "../../interfaces/memory-service.interface";
import { IMessageHandler } from "../../interfaces/message-handler.interface";
import { IVideoService } from "../../interfaces/video-service.interface";
import { VideoRecord } from "../../model/video.record";
import { MemoryService } from "../../services/memory.service";
import { createVideoKeyboard } from "../../shared/keyboards";

export class TikTokMessageHandler implements IMessageHandler {
  private readonly memoryService: IMemoryService = new MemoryService();

  constructor(private videoService: IVideoService) { }

  canHandle(ctx: MessageContext<Bot>): boolean {
    const text = ctx.text;
    if (!text) return false;
    if (text.startsWith("/")) return false;
    return text.includes("tiktok.com/");
  }

  async handle(ctx: MessageContext<Bot>): Promise<void> {
    const url = ctx.text!;
    const statusMessage = await ctx.send("Завантаження відео...");

    ctx.delete(ctx.id);

    try {
      const arhive = await this.memoryService.findByUrl(url, ctx.chatId);

      if (arhive) {
        const fileId = arhive.getFileId.toString();
        await statusMessage.delete();
        const sentMessage = await ctx.sendVideo(fileId, {
          reply_markup: createVideoKeyboard(0),
        });
        const updatedKeyboard = createVideoKeyboard(sentMessage.id);
        await sentMessage.editReplyMarkup(updatedKeyboard);
        return;
      }

      const file = await this.videoService.download(url);

      if (!file) {
        await statusMessage.delete().catch(() => { });
        await ctx.reply("Не вдалося завантажити відео");
        return;
      }

      try {
        await this.sendVideo(ctx, statusMessage, file, url);
      } finally {
        await unlink(file).catch(err => console.error("Помилка видалення файлу:", err));
      }
    } catch (error) {
      console.error(error);
      await ctx.reply("Сталася помилка при обробці відео");
    }
  }

  private async sendVideo(
    ctx: MessageContext<Bot>,
    statusMessage: { delete(): Promise<unknown> },
    file: string,
    url: string,
  ): Promise<void> {
    const { messageId, chatId } = { messageId: ctx.id, chatId: ctx.chatId };

    const buffer = await readFile(file);
    await statusMessage.delete();

    const keyboard = createVideoKeyboard(0);

    const sentMessage = await ctx.sendVideo(MediaUpload.buffer(buffer, file), {
      reply_markup: keyboard, caption: `Опять цей ${ctx.chat.username} відправив тікіток\n`,
    });

    const fileId = sentMessage.video?.fileId;

    const record: VideoRecord = new VideoRecord(
      url,
      messageId,
      chatId,
      fileId ?? "error",
    );
    this.memoryService.save(record);

    const updatedKeyboard = createVideoKeyboard(sentMessage.id);
    await sentMessage.editReplyMarkup(updatedKeyboard);
  }
}