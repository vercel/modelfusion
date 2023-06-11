export type RetryFunction = <OUTPUT>(
  fn: () => PromiseLike<OUTPUT>
) => PromiseLike<OUTPUT>;
