import { ModelInformation } from "./ModelInformation.js";

export type ModelCallMetadata = {
  model: ModelInformation;

  callId: string;
  runId?: string;
  sessionId?: string;
  userId?: string;
  functionId?: string;

  startTimestamp: Date;
  finishTimestamp: Date;
  durationInMs: number;

  usage?: unknown;
};
