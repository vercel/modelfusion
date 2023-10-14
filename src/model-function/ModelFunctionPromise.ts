import { ModelCallMetadata } from "./ModelCallMetadata.js";

export class ModelFunctionPromise<VALUE> extends Promise<VALUE> {
  private valuePromise: Promise<VALUE>;

  constructor(
    private fullPromise: Promise<{
      value: VALUE;
      response: unknown;
      metadata: ModelCallMetadata;
    }>
  ) {
    super((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(null as any); // we override the resolve function
    });

    this.valuePromise = fullPromise.then((result) => result.value);
  }

  asFullResponse(): Promise<{
    value: VALUE;
    response: unknown;
    metadata: ModelCallMetadata;
  }> {
    return this.fullPromise;
  }

  override then<TResult1 = VALUE, TResult2 = never>(
    onfulfilled?:
      | ((value: VALUE) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.valuePromise.then(onfulfilled, onrejected);
  }

  override catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<VALUE | TResult> {
    return this.valuePromise.catch(onrejected);
  }

  override finally(
    onfinally?: (() => void) | undefined | null
  ): Promise<VALUE> {
    return this.valuePromise.finally(onfinally);
  }
}
