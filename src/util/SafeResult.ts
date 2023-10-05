export type SafeResult<OUTPUT> =
  | { ok: true; value: OUTPUT }
  | { ok: false; isAborted?: boolean; error?: unknown };
