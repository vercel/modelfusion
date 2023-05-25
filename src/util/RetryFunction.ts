export type RetryResult<T> = {
  tries: number;
} & (
  | {
      status: "success";
      result: T;
    }
  | {
      status: "failure";
      error: unknown;
    }
  | {
      status: "abort";
    }
);

export type RetryFunction = <T>(
  f: () => PromiseLike<T>
) => Promise<RetryResult<T>>;
