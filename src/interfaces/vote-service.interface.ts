export interface VoteResult {
  likes: number;
  dislikes: number;
  shouldDelete: boolean;
}

export interface IVoteService {
  addVote(messageId: number, userId: number, type: "like" | "dislike"): Promise<VoteResult>;
  deleteVote(messageId: number): Promise<void>;
}
