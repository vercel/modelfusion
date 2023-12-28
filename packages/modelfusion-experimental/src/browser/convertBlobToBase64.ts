export async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result) {
        const base64String = btoa(
          new Uint8Array(reader.result as ArrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        resolve(base64String);
      } else {
        reject(new Error("Failed to read blob."));
      }
    };

    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem parsing input blob."));
    };

    reader.readAsArrayBuffer(blob);
  });
}
