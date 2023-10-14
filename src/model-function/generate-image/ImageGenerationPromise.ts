import { ModelCallMetadata } from "../ModelCallMetadata.js";

export class ImageGenerationPromise extends Promise<Buffer> {
  private imageBase64Promise: Promise<string>;
  private imageBufferPromise: Promise<Buffer>;

  constructor(
    private fullPromise: Promise<{
      value: string;
      response: unknown;
      metadata: ModelCallMetadata;
    }>
  ) {
    super((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(null as any); // we override the resolve function
    });

    this.imageBase64Promise = fullPromise.then((result) => result.value);
    this.imageBufferPromise = this.imageBase64Promise.then((base64Text) =>
      Buffer.from(base64Text, "base64")
    );
  }

  asFullResponse(): Promise<{
    value: string;
    response: unknown;
    metadata: ModelCallMetadata;
  }> {
    return this.fullPromise;
  }

  asBase64Text(): Promise<string> {
    return this.imageBase64Promise;
  }

  asBuffer(): Promise<Buffer> {
    return this.imageBufferPromise;
  }

  override then<TResult1 = Buffer, TResult2 = never>(
    onfulfilled?:
      | ((value: Buffer) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.imageBufferPromise.then(onfulfilled, onrejected);
  }

  override catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<Buffer | TResult> {
    return this.imageBufferPromise.catch(onrejected);
  }

  override finally(
    onfinally?: (() => void) | undefined | null
  ): Promise<Buffer> {
    return this.imageBufferPromise.finally(onfinally);
  }
}
