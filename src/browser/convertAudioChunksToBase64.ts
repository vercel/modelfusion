import { convertBlobToBase64 } from "./convertBlobToBase64.js";

export function convertAudioChunksToBase64({
  audioChunks,
  mimeType,
}: {
  audioChunks: Blob[];
  mimeType: string;
}): Promise<string> {
  return convertBlobToBase64(new Blob(audioChunks, { type: mimeType }));
}
