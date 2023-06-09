import { RunObserver } from "./RunObserver.js";

export interface RunContext {
  /**
   * Unique ID for the run. Used to identify the run in the logs.
   */
  runId?: string;

  /**
   * Used to identify the session. Used to identify the session in the logs.
   *
   * A session can span multiple runs, e.g. in a chat bot where each message is a separate run.
   */
  sessionId?: string;

  /**
   * The user ID of the user who initiated the call.
   *
   * This information included in the call events for logging. You can also configure the model
   * to forward it the model provider (e.g. OpenAI).
   *
   * Do not include any personal identifying information here.
   */
  userId?: string;

  abortSignal?: AbortSignal;

  observers?: RunObserver[];
}
