export const retryNever =
  () =>
  async <OUTPUT>(f: () => PromiseLike<OUTPUT>) =>
    f();
