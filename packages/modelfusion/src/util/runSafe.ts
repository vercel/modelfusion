import { SafeResult } from "./SafeResult.js";

export const runSafe = async <OUTPUT>(
  f: () => PromiseLike<OUTPUT>
): Promise<SafeResult<OUTPUT>> => {
  try {
    return { ok: true, value: await f() };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, isAborted: true };
    }

    return { ok: false, error };
  }
};
