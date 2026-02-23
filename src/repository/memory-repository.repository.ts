import { VideoRecord } from "../model/video.record";
import { IMemoryRepository } from "../interfaces/memory-repository.interface";

const globalMemory: VideoRecord[] = [];

export class MemoryRepository implements IMemoryRepository {
  async save(videoRecord: VideoRecord): Promise<boolean> {
    try {
      const existingIndex = globalMemory.findIndex(
        (m) => m.getUrl === videoRecord.getUrl && m.getChatId === videoRecord.getChatId
      );

      if (existingIndex >= 0) {
        globalMemory[existingIndex] = videoRecord;
      } else {
        globalMemory.push(videoRecord);
      }
      return true;
    } catch (exception) {
      console.error("Помилка збереження в пам'ять:", exception);
      return false;
    }
  }

  async findAll(): Promise<VideoRecord[]> {
    return [...globalMemory];
  }

  async findByUrl(url: String, chatId: Number): Promise<VideoRecord | null> {
    const record = globalMemory.find(
      (m) => m.getUrl === url && m.getChatId === chatId
    );
    return record || null;
  }

  async delete(messageId: Number, chatId: Number): Promise<boolean> {
    const index = globalMemory.findIndex(
      (m) => m.getMessageId === messageId && m.getChatId === chatId
    );

    if (index !== -1) {
      globalMemory.splice(index, 1);
      return true;
    }

    return false;
  }
}