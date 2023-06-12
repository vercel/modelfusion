/**
 * The `retryNever` strategy never retries a failed API call.
 */
export const retryNever =
  () =>
  async <OUTPUT>(f: () => PromiseLike<OUTPUT>) =>
    f();
