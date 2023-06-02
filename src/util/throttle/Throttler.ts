export interface Throttler {
  run<T>(fn: () => PromiseLike<T>): PromiseLike<T>;
  asFunction(): <T>(fn: () => PromiseLike<T>) => PromiseLike<T>;
}
