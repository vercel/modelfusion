export type RetryFunction = <OUTPUT>(
  f: () => PromiseLike<OUTPUT>
) => PromiseLike<OUTPUT>;
