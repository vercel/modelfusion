export type ThrottleFunction = <OUTPUT>(
  fn: () => PromiseLike<OUTPUT>
) => PromiseLike<OUTPUT>;
