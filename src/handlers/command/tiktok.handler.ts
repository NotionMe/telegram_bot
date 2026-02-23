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
      const file = await this.videoService.download(url);

      if (!file) {
        await ctx.reply("Не вдалося завантажити відео");
        return;
      }

      await this.sendVideo(ctx, statusMessage, file, url);
      await unlink(file);
    } catch (error) {
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
  ): Promise<void> {


    const { messageId, chatId } = { messageId: ctx.id, chatId: ctx.chatId };

    const buffer = await readFile(file);
    await statusMessage.delete();

    const keyboard = createVideoKeyboard(0);

    const arhive = await this.memoryService.findByUrl(url, chatId);

    let sentMessage;

    const [url2, ...otherArgs] = ctx.text?.replace(/^\/tiktok\s*/, "").trim().split(" ") ?? [];

    if (arhive) {
      const fileId = arhive.getFileId.toString();
      sentMessage = await ctx.sendVideo(fileId);
    } else {
      sentMessage = await ctx.sendVideo(MediaUpload.buffer(buffer, file), {
        reply_markup: keyboard,
        caption: otherArgs.toString(),
      });
    }

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
