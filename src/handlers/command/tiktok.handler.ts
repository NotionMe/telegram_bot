import { readFile, unlink } from "fs/promises";
import { Bot, MediaUpload, MessageContext } from "gramio";
import { ICommandHandler } from "../../interfaces/command-handler.interface";
import { IMemoryService } from "../../interfaces/memory-service.interface";
import { IVideoService } from "../../interfaces/video-service.interface";
import { VideoRecord } from "../../model/video.record";
import { MemoryService } from "../../services/memory.service";
import { createVideoKeyboard } from "../../shared/keyboards";

export class TikTokCommandHandler implements ICommandHandler {
  readonly command = "tiktok";

  private readonly memoryService: IMemoryService = new MemoryService();

  constructor(private videoService: IVideoService) { }

  async handle(ctx: MessageContext<Bot>): Promise<void> {
    const url = this.extractUrl(ctx.text);
    const [url2, ...otherArgs] = ctx.text?.replace(/^\/tiktok\s*/, "").trim().split(" ") ?? [];
    const captionText = otherArgs.join(" ") || undefined;

    if (!url) {
      await ctx.send("Ви не передали URL TikTok!");
      return;
    }

    if (!this.isValidTikTokUrl(url)) {
      await ctx.send("Будь ласка, надішліть коректний TikTok URL");
      return;
    }

    const statusMessage = await ctx.send("Завантаження відео...");

    try {
      const arhive = await this.memoryService.findByUrl(url, ctx.chatId);

      if (arhive) {
        const fileId = arhive.getFileId.toString();
        await statusMessage.delete().catch(() => { });
        const sentMessage = await ctx.sendVideo(fileId, {
          reply_markup: createVideoKeyboard(0),
          caption: captionText,
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
        await this.sendVideo(ctx, statusMessage, file, url, captionText);
      } finally {
        await unlink(file).catch(err => console.error("Помилка видалення файлу:", err));
      }
    } catch (error) {
      console.error(error);
      await statusMessage.delete().catch(() => { });
      await ctx.reply("Сталася помилка при завантаженні відео");
    }
  }

  private extractUrl(text: string | undefined): string | null {
    if (!text) return null;
    const args = text.replace(/^\/tiktok\s*/, "").trim();

    return args.split(" ")[0] || null;
  }

  private isValidTikTokUrl(url: string): boolean {
    return url.includes("tiktok.com/");
  }

  private async sendVideo(
    ctx: MessageContext<Bot>,
    statusMessage: { delete(): Promise<unknown> },
    file: string,
    url: string,
    caption?: string
  ): Promise<void> {
    const { messageId, chatId } = { messageId: ctx.id, chatId: ctx.chatId };

    const buffer = await readFile(file);
    await statusMessage.delete().catch(() => { });

    const keyboard = createVideoKeyboard(0);

    const sentMessage = await ctx.sendVideo(MediaUpload.buffer(buffer, file), {
      reply_markup: keyboard,
      caption: `Опять цей ${ctx.chat.username} відправив тікіток\n ${caption}`,
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