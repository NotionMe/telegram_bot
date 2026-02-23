import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { IVoteService, VoteResult } from "../interfaces/vote-service.interface";

interface VoteData {
  likes: number;
  dislikes: number;
  usersVoted: number[];
}

export class VoteService implements IVoteService {
  private readonly votesFile: string;

  constructor(votesFile = "./votes.json") {
    this.votesFile = votesFile;
  }

  async addVote(
    messageId: number,
    userId: number,
    type: "like" | "dislike"
  ): Promise<VoteResult> {
    const votes = await this.loadVotes();
    const key = messageId.toString();

    if (!votes[key]) {
      votes[key] = { likes: 0, dislikes: 0, usersVoted: [] };
    }

    const voteData = votes[key];

    if (voteData.usersVoted.includes(userId)) {
      return {
        likes: voteData.likes,
        dislikes: voteData.dislikes,
        shouldDelete: false,
      };
    }

    voteData.usersVoted.push(userId);

    if (type === "like") {
      voteData.likes++;
    } else {
      voteData.dislikes++;
    }

    await this.saveVotes(votes);

    return {
      likes: voteData.likes,
      dislikes: voteData.dislikes,
      shouldDelete: voteData.dislikes >= 3,
    };
  }

  async deleteVote(messageId: number): Promise<void> {
    const votes = await this.loadVotes();
    delete votes[messageId.toString()];
    await this.saveVotes(votes);
  }

  private async loadVotes(): Promise<Record<string, VoteData>> {
    if (!existsSync(this.votesFile)) {
      return {};
    }
    const data = await readFile(this.votesFile, "utf-8");
    return JSON.parse(data);
  }

  private async saveVotes(votes: Record<string, VoteData>): Promise<void> {
    await writeFile(this.votesFile, JSON.stringify(votes, null, 2));
  }
}
