import { AsyncQueue } from "modelfusion";

export class AudioSource {
  readonly mediaSource = new MediaSource();
  readonly audioChunks = new AsyncQueue<ArrayBuffer>();

  constructor() {
    this.mediaSource.addEventListener("sourceopen", async () => {
      const sourceBuffer = this.mediaSource.addSourceBuffer("audio/mpeg");

      const queue: ArrayBuffer[] = [];
      let isAppending = false;

      function processAppendQueue() {
        if (!isAppending && queue.length > 0) {
          isAppending = true;
          const chunk = queue.shift();
          if (chunk != null) sourceBuffer.appendBuffer(chunk);
        }
      }

      sourceBuffer.addEventListener("updateend", () => {
        isAppending = false;
        processAppendQueue();
      });

      for await (const audioChunk of this.audioChunks) {
        queue.push(audioChunk);
        processAppendQueue();
      }

      this.mediaSource.endOfStream();
    });
  }

  addBase64Audio(base64Audio: string) {
    const binaryString = atob(base64Audio);
    const bufferArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bufferArray[i] = binaryString.charCodeAt(i);
    }
    this.audioChunks.push(bufferArray.buffer);
  }

  close() {
    this.audioChunks.close();
  }

  get audioUrl() {
    return URL.createObjectURL(this.mediaSource);
  }
}
