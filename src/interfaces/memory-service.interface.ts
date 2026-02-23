import { VideoRecord } from "../model/video.record";

export interface IMemoryService {
    save(videoRecord: VideoRecord): Promise<boolean>;
    findAll(messageId: Number, chatId: Number): Promise<VideoRecord>;
    findByUrl(url: String, chatId: Number): Promise<VideoRecord | null>;
    delete(messageId: Number, chatId: Number): Promise<boolean>;
}
