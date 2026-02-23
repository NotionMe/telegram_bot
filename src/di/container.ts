import { Bot } from "gramio";
import { config } from "../config/config";
import { IVideoService } from "../interfaces/video-service.interface";
import { IVoteService } from "../interfaces/vote-service.interface";
import { ICommandHandler } from "../interfaces/command-handler.interface";
import { IMessageHandler } from "../interfaces/message-handler.interface";
import { TikTokVideoService } from "../services/tiktok-video.service";
import { VoteService } from "../services/vote.service";
import { StartCommandHandler } from "../handlers/command/start.handler";
import { TikTokCommandHandler } from "../handlers/command/tiktok.handler";
import { TikTokMessageHandler } from "../handlers/message/tiktok-message.handler";
import { LikeCallbackHandler } from "../handlers/callback/like.handler";
import { DislikeCallbackHandler } from "../handlers/callback/dislike.handler";
import { BotController } from "../controllers/bot.controller";
import { MemoryRepository } from "../repository/memory-repository.repository";
import { IMemoryRepository } from "../interfaces/memory-repository.interface";

export class Container {
  private bot: Bot;
  private videoService: IVideoService;
  private voteService: IVoteService;
  private commandHandlers: ICommandHandler[];
  private messageHandlers: IMessageHandler[];
  private likeHandler: LikeCallbackHandler;
  private dislikeHandler: DislikeCallbackHandler;
  private botController: BotController;
  private memoryRepository: IMemoryRepository;

  constructor() {
    // Bot instance
    this.bot = new Bot(config.BOT_TOKEN);

    // Services
    this.videoService = new TikTokVideoService();
    this.voteService = new VoteService();

    // Repository
    this.memoryRepository = new MemoryRepository();

    // Command handlers
    this.commandHandlers = [
      new StartCommandHandler(),
      new TikTokCommandHandler(this.videoService),
    ];

    // Message handlers
    this.messageHandlers = [new TikTokMessageHandler(this.videoService)];

    // Callback handlers
    this.likeHandler = new LikeCallbackHandler(this.voteService);
    this.dislikeHandler = new DislikeCallbackHandler(
      this.voteService,
      this.bot,
    );

    // Controller
    this.botController = new BotController(
      this.bot,
      this.commandHandlers,
      this.messageHandlers,
      this.likeHandler,
      this.dislikeHandler,
    );
  }

  getBot(): Bot {
    return this.bot;
  }

  getController(): BotController {
    return this.botController;
  }
}
