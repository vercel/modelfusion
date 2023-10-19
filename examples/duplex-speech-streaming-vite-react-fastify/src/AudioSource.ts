export class AudioSource {
  private readonly mediaSource = new MediaSource();
  private readonly audioChunks: ArrayBuffer[] = [];

  private sourceBuffer?: SourceBuffer;

  constructor() {
    this.mediaSource.addEventListener("sourceopen", async () => {
      this.sourceBuffer = this.mediaSource.addSourceBuffer("audio/mpeg");

      this.sourceBuffer.addEventListener("updateend", () => {
        this.tryAppendNextChunk();
      });
    });
  }

  private tryAppendNextChunk() {
    if (
      this.sourceBuffer != null &&
      !this.sourceBuffer.updating &&
      this.audioChunks.length > 0
    ) {
      this.sourceBuffer.appendBuffer(this.audioChunks.shift()!);
    }
  }

  public addBase64Audio(base64Audio: string) {
    const bufferArray = Uint8Array.from(atob(base64Audio), (char) =>
      char.charCodeAt(0)
    );

    this.audioChunks.push(bufferArray.buffer);
    this.tryAppendNextChunk();
  }

  public close() {
    if (this.mediaSource.readyState === "open") {
      this.mediaSource.endOfStream();
    }
  }

  public get audioUrl() {
    return URL.createObjectURL(this.mediaSource);
  }
}
