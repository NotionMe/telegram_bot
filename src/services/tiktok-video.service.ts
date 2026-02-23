import { IVideoService } from "../interfaces/video-service.interface";
import ytDlp from "yt-dlp-exec";
import { randomUUID } from "crypto";
import { join } from "path";
import { stat } from "fs/promises";
import { tmpdir } from "os";

export class TikTokVideoService implements IVideoService {
  async download(url: string): Promise<string | null> {
    if (!url.trim()) return null;

    try {
      const fileName = `${randomUUID()}.mp4`;
      const filePath = join(tmpdir(), fileName);

      console.log(`Починаємо завантаження: ${url}`);

      await ytDlp(url, {
        noWarnings: true,
        noPlaylist: true,
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        output: filePath,
      });

      const fileStats = await stat(filePath);
      if (fileStats.size === 0) {
        throw new Error("Файл порожній");
      }

      console.log(`Відео завантажено успішно: ${filePath}`);
      return filePath;
    } catch (error: any) {
      console.error("Помилка завантаження yt-dlp:", error?.message || error);
      return null;
    }
  }
}