export type Delta<T> =
  | {
      type: "delta";
      fullDelta: unknown;
      valueDelta: T;
    }
  | {
      type: "error";
      error: unknown;
    };
