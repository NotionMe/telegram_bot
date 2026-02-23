export class VideoRecord {
  private url: String;
  private messageId: Number;
  private chatId: Number;
  private fileId: String;

  constructor(url: String, messageId: Number, chatId: Number, fileId: String) {
    this.url = url;
    this.messageId = messageId;
    this.chatId = chatId;
    this.fileId = fileId;
  }

  get getUrl(): String {
    return this.url;
  }
  get getMessageId(): Number {
    return this.messageId;
  }
  get getChatId(): Number {
    return this.chatId;
  }
  get getFileId(): String {
    return this.fileId;
  }
}
