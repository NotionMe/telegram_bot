import { IVideoService } from "../interfaces/video-service.interface";
import { exec } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";
import { join } from "path";
import { stat } from "fs/promises";

const execAsync = promisify(exec);

export class TikTokVideoService implements IVideoService {
  async download(url: string): Promise<string | null> {
    if (!url.trim()) return null;

    try {
      const fileName = `${randomUUID()}.mp4`;
      const filePath = join("/tmp", fileName);

      const command = `yt-dlp --no-warnings --no-playlist -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${filePath}" "${url}"`;

      console.log(`Починаємо завантаження: ${url}`);
      await execAsync(command);

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