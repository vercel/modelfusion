export type DeltaEvent<FULL_DELTA> =
  | {
      type: "delta";
      fullDelta: FULL_DELTA;
    }
  | {
      type: "error";
      error: unknown;
    }
  | undefined;
