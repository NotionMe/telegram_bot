import { VideoRecord } from "../model/video.record";

export interface IMemoryRepository {
  save(videoRecord: VideoRecord): Promise<boolean>;
  findAll(): Promise<VideoRecord[]>;
  findByUrl(url: String, chatId: Number): Promise<VideoRecord | null>;
  delete(messageId: Number, chatId: Number): Promise<boolean>;
}