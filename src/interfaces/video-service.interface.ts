export interface IVideoService {
  download(url: string): Promise<string | null>;
}
