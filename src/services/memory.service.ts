import { IMemoryService } from "../interfaces/memory-service.interface";
import { VideoRecord } from "../model/video.record";
import { IMemoryRepository } from "../interfaces/memory-repository.interface";
import { MemoryRepository } from "../repository/memory-repository.repository";

export class MemoryService implements IMemoryService {
    private readonly memoryRepository: IMemoryRepository = new MemoryRepository();

    async save(videoRecord: VideoRecord): Promise<boolean> {
        try {
            const memories = await this.memoryRepository.findAll();
            const existing = memories.find(m => m.getMessageId === videoRecord.getMessageId);

            if (existing) {
                console.log(`memory find chat: ${existing.getChatId}, file id: ${existing.getFileId}`);
                return false;
            }
        } catch (error) {
            console.error("Помилка при перевірці пам'яті:", error);
        }
        return await this.memoryRepository.save(videoRecord);
    }

    async findAll(messageId: Number, chatId: Number): Promise<VideoRecord> {
        throw new Error("Method not implemented.");
    }

    async findByUrl(url: string, chatId: number): Promise<VideoRecord | null> {
        if (!url || !chatId) return null;

        try {
            return await this.memoryRepository.findByUrl(url, chatId);
        } catch (err) {
            throw new Error("Error to get from memories");
        }
    }

    async delete(messageId: Number, chatId: Number): Promise<boolean> {
        return await this.memoryRepository.delete(messageId, chatId);
    }
}