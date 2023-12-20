import { ErrorHandler } from "../util/ErrorHandler.js";
import { FunctionObserver } from "./FunctionObserver.js";

export interface Run {
  /**
   * Unique identifier for a specific run. Primarily utilized for efficient referencing
   * and tracking within logs.
   */
  runId?: string;

  /**
   * Unique identifier for a session. A session can contain multiple runs. For example, in
   * a chatbot where each message is processed as a separate run, all those runs could be
   * part of a single session. Useful for tracking and logging.
   */
  sessionId?: string;

  /**
   * The user ID of the individual who initiates the call. Useful for logging and can be
   * configured to be forwarded to the model provider (like OpenAI).
   */
  userId?: string;

  /**
   * An AbortSignal that can be used to cancel any ongoing asynchronous operations tied
   * to the run.
   */
  abortSignal?: AbortSignal;

  /**
   * Optional field that represents the run as a function observer. When it is defined,
   * the run will be notified of all function events.
   */
  functionObserver?: FunctionObserver;

  errorHandler?: ErrorHandler;
}
