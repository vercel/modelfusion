import { createId } from "@paralleldrive/cuid2";
import { RunContext } from "../../run/RunContext.js";
import { Vector } from "../../run/Vector.js";
import { AbortError } from "../../util/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { EmbedTextEndEvent, EmbedTextStartEvent } from "./EmbedTextEvent.js";
import { EmbedTextObserver } from "./EmbedTextObserver.js";
import {
  TextEmbeddingFunction,
  TextsEmbeddingFunction,
} from "./TextEmbeddingFunction.js";
import { TextEmbeddingModel } from "./TextEmbeddingModel.js";

export async function embedTexts<RAW_OUTPUT>(
  {
    functionId,
    model,
    texts,
    onStart,
    onEnd,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT>;
    texts: Array<string>;
    onStart?: (event: EmbedTextStartEvent) => void;
    onEnd?: (event: EmbedTextEndEvent) => void;
  },
  context?: RunContext & EmbedTextObserver
): Promise<Array<Vector>> {
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
      modelName: model.model,
    },
    startEpochSeconds,
  };

  const startEvent: EmbedTextStartEvent = {
    type: "embed-text-start",
    metadata: startMetadata,
    texts,
  };

  onStart?.(startEvent);
  context?.onEmbedTextStart?.(startEvent);

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

  // embed each group (run in parallel, throttling should happen at embedding model level):
  const rawOutputs: Array<RAW_OUTPUT> = await Promise.all(
    textGroups.map(async (textGroup) => {
      const result = await runSafe(() => model.embed(textGroup, context));

      if (!result.ok) {
        if (result.isAborted) {
          const endEvent: EmbedTextEndEvent = {
            type: "embed-text-end",
            status: "abort",
            metadata,
            texts,
          };

          onEnd?.(endEvent);
          context?.onEmbedTextEnd?.(endEvent);

          throw new AbortError();
        }

        const endEvent: EmbedTextEndEvent = {
          type: "embed-text-end",
          status: "failure",
          metadata,
          texts,
          error: result.error,
        };

        onEnd?.(endEvent);
        context?.onEmbedTextEnd?.(endEvent);

        throw result.error;
      }

      return result.output;
    })
  );

  // combine the results:
  const embeddings: Array<Array<number>> = [];
  for (const rawOutput of rawOutputs) {
    embeddings.push(...(await model.extractEmbeddings(rawOutput)));
  }

  const endEvent: EmbedTextEndEvent = {
    type: "embed-text-end",
    status: "success",
    metadata,
    texts,
    rawOutputs,
    embeddings,
  };

  onEnd?.(endEvent);
  context?.onEmbedTextEnd?.(endEvent);

  return embeddings;
}

embedTexts.asFunction =
  <RAW_OUTPUT>({
    functionId,
    model,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT>;
  }): TextsEmbeddingFunction =>
  async (texts: Array<string>, context?: RunContext & EmbedTextObserver) =>
    embedTexts({ functionId, model, texts }, context);

export async function embedText<RAW_OUTPUT>(
  {
    functionId,
    model,
    text,
    onStart,
    onEnd,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT>;
    text: string;
    onStart?: (event: EmbedTextStartEvent) => void;
    onEnd?: (event: EmbedTextEndEvent) => void;
  },
  context?: RunContext & EmbedTextObserver
): Promise<Array<number>> {
  return (
    await embedTexts(
      {
        functionId,
        model,
        texts: [text],
        onStart,
        onEnd,
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
  }): TextEmbeddingFunction =>
  async (text: string, context?: RunContext & EmbedTextObserver) =>
    embedText({ functionId, model, text }, context);
