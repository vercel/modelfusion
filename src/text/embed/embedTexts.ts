import { createId } from "@paralleldrive/cuid2";
import {
  EmbedCallEndEvent,
  EmbedCallStartEvent,
} from "../../run/EmbedCallEvent.js";
import { RunContext } from "../../run/RunContext.js";
import { AbortError } from "../../util/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { TextEmbeddingModel } from "./TextEmbeddingModel.js";

export async function embedTexts<RAW_OUTPUT>(
  {
    functionId,
    model,
    texts,
    onCallStart,
    onCallEnd,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT>;
    texts: Array<string>;
    onCallStart?: (call: EmbedCallStartEvent) => void;
    onCallEnd?: (call: EmbedCallEndEvent) => void;
  },
  context?: RunContext
): Promise<Array<Array<number>>> {
  const startTime = performance.now();
  const startEpochSeconds = Math.floor(
    (performance.timeOrigin + startTime) / 1000
  );

  const callId = createId();

  const startMetadata = {
    callId,
    functionId,
    runId: context?.runId,
    sessionId: context?.sessionId,
    userId: context?.userId,

    model: {
      provider: model.provider,
      name: model.model,
    },
    startEpochSeconds,
  };

  const callStartEvent: EmbedCallStartEvent = {
    type: "embed-start",
    metadata: startMetadata,
    texts,
  };

  onCallStart?.(callStartEvent);
  context?.onCallStart?.(callStartEvent);

  const textGenerationDurationInMs = Math.ceil(performance.now() - startTime);

  const metadata = {
    durationInMs: textGenerationDurationInMs,
    ...startMetadata,
  };

  // split the texts into groups:
  const maxTextsPerCall = model.maxTextsPerCall;
  const textGroups = [];
  for (let i = 0; i < texts.length; i += maxTextsPerCall) {
    textGroups.push(texts.slice(i, i + maxTextsPerCall));
  }

  // embed each group:
  const rawOutputs: Array<RAW_OUTPUT> = [];
  for (const textGroup of textGroups) {
    const result = await runSafe(() => model.embed(textGroup, context));

    if (!result.ok) {
      if (result.isAborted) {
        const callEndEvent: EmbedCallEndEvent = {
          type: "embed-end",
          status: "abort",
          metadata,
          texts,
        };

        onCallEnd?.(callEndEvent);
        context?.onCallEnd?.(callEndEvent);

        throw new AbortError();
      }

      const callEndEvent: EmbedCallEndEvent = {
        type: "embed-end",
        status: "failure",
        metadata,
        texts,
        error: result.error,
      };

      onCallEnd?.(callEndEvent);
      context?.onCallEnd?.(callEndEvent);

      throw result.error;
    }

    rawOutputs.push(result.output);
  }

  // combine the results:
  const embeddings: Array<Array<number>> = [];
  for (const rawOutput of rawOutputs) {
    embeddings.push(...(await model.extractEmbeddings(rawOutput)));
  }

  const callEndEvent: EmbedCallEndEvent = {
    type: "embed-end",
    status: "success",
    metadata,
    texts,
    rawOutputs,
    embeddings,
  };

  onCallEnd?.(callEndEvent);
  context?.onCallEnd?.(callEndEvent);

  return embeddings;
}

embedTexts.asFunction =
  <RAW_OUTPUT>({
    functionId,
    model,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT>;
  }) =>
  async ({ texts }: { texts: Array<string> }, context?: RunContext) =>
    embedTexts({ functionId, model, texts }, context);

export async function embedText<RAW_OUTPUT>(
  {
    functionId,
    model,
    text,
    onCallStart,
    onCallEnd,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT>;
    text: string;
    onCallStart?: (call: EmbedCallStartEvent) => void;
    onCallEnd?: (call: EmbedCallEndEvent) => void;
  },
  context?: RunContext
): Promise<Array<number>> {
  return (
    await embedTexts(
      {
        functionId,
        model,
        texts: [text],
        onCallStart,
        onCallEnd,
      },
      context
    )
  )[0];
}

embedText.asFunction =
  <RAW_OUTPUT>({
    functionId,
    model,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT>;
  }) =>
  async ({ text }: { text: string }, context?: RunContext) =>
    embedText({ functionId, model, text }, context);
