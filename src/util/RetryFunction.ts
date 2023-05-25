export type RetryFunction = <T>(f: () => PromiseLike<T>) => Promise<
  {
    tries: number;
  } & (
    | {
        success: true;
        result: T;
      }
    | {
        success: false;
        error: unknown;
      }
  )
>;
