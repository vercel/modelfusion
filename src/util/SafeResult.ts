export type SafeResult<OUTPUT> =
  | { ok: true; output: OUTPUT }
  | { ok: false; isAborted?: boolean; error?: unknown };
