export function convertBase64ToArrayBuffer(base64Text: string) {
  const binaryString = atob(base64Text);
  const bufferArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bufferArray[i] = binaryString.charCodeAt(i);
  }
  return bufferArray.buffer;
}
