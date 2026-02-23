import { YtDlp } from "ytdlp-nodejs";
import { IVideoService } from "../interfaces/video-service.interface";

export class TikTokVideoService implements IVideoService {
  private ytdlp = new YtDlp();

  async download(url: string): Promise<string | null> {
    if (!url.trim()) return null;

    try {
      const result = await this.ytdlp
        .download(url)
        .quality("best")
        .type("mp4")
        .run();

      return result.filePaths[0] ?? null;
    } catch (error) {
      console.error("Download error:", error);
      return null;
    }
  }
}
