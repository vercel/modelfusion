import { nanoid as createId } from "nanoid";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { AbortError } from "../../util/api/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { ModelCallEventSource } from "../ModelCallEventSource.js";
import {
  TextStreamingModel,
  TextStreamingModelSettings,
} from "./TextStreamingModel.js";
import { extractTextDeltas } from "./extractTextDeltas.js";

export async function streamText<
  PROMPT,
  FULL_DELTA,
  SETTINGS extends TextStreamingModelSettings
>(
  model: TextStreamingModel<PROMPT, FULL_DELTA, SETTINGS>,
  prompt: PROMPT,
  options?: FunctionOptions<SETTINGS>
): Promise<AsyncIterable<string>> {
  if (options?.settings != null) {
    return streamText(model.withSettings(options.settings), prompt, {
      functionId: options.functionId,
      run: options.run,
    });
  }

  const run = options?.run;
  const settings = model.settings;

  const eventSource = new ModelCallEventSource({
    observers: [...(settings.observers ?? []), ...(run?.observers ?? [])],
    errorHandler: run?.errorHandler,
  });

  const startTime = performance.now();
  const startEpochSeconds = Math.floor(
    (performance.timeOrigin + startTime) / 1000
  );

  const callId = `call-${createId()}`;

  const startMetadata = {
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,
    callId,
    model: model.modelInformation,
    startEpochSeconds,
  };

  eventSource.notifyModelCallStarted({
    type: "text-streaming-started",
    metadata: startMetadata,
    settings,
    prompt,
  });

  const result = await runSafe(async () =>
    extractTextDeltas({
      deltaIterable: await model.generateDeltaStreamResponse(prompt, {
        functionId: options?.functionId,
        settings, // options.setting is null here because of the initial guard
        run,
      }),
      extractDelta: (fullDelta) => model.extractTextDelta(fullDelta),
      onDone: (fullText, lastFullDelta) => {
        const generationDurationInMs = Math.ceil(performance.now() - startTime);

        const finishMetadata = {
          ...startMetadata,
          durationInMs: generationDurationInMs,
        };

        eventSource.notifyModelCallFinished({
          type: "text-streaming-finished",
          status: "success",
          metadata: finishMetadata,
          settings,
          prompt,
          response: lastFullDelta,
          generatedText: fullText,
        });
      },
      onError: (error) => {
        const generationDurationInMs = Math.ceil(performance.now() - startTime);

        const finishMetadata = {
          ...startMetadata,
          durationInMs: generationDurationInMs,
        };

        eventSource.notifyModelCallFinished(
          error instanceof AbortError
            ? {
                type: "text-streaming-finished",
                status: "abort",
                metadata: finishMetadata,
                settings,
                prompt,
              }
            : {
                type: "text-streaming-finished",
                status: "failure",
                metadata: finishMetadata,
                settings,
                prompt,
                error,
              }
        );
      },
    })
  );

  if (!result.ok) {
    const generationDurationInMs = Math.ceil(performance.now() - startTime);

    const finishMetadata = {
      ...startMetadata,
      durationInMs: generationDurationInMs,
    };

    if (result.isAborted) {
      eventSource.notifyModelCallFinished({
        type: "text-streaming-finished",
        status: "abort",
        metadata: finishMetadata,
        settings,
        prompt,
      });
      throw new AbortError();
    }

    eventSource.notifyModelCallFinished({
      type: "text-streaming-finished",
      status: "failure",
      metadata: finishMetadata,
      settings,
      prompt,
      error: result.error,
    });
    throw result.error;
  }

  return result.output;
}

export function streamTextAsFunction<
  INPUT,
  PROMPT,
  FULL_DELTA,
  SETTINGS extends TextStreamingModelSettings
>(
  model: TextStreamingModel<PROMPT, FULL_DELTA, SETTINGS>,
  promptTemplate: PromptTemplate<INPUT, PROMPT>,
  generateOptions?: Omit<FunctionOptions<SETTINGS>, "run">
) {
  return async (input: INPUT, options?: FunctionOptions<SETTINGS>) => {
    const expandedPrompt = await promptTemplate(input);
    return streamText(model, expandedPrompt, {
      functionId: options?.functionId ?? generateOptions?.functionId,
      settings: Object.assign({}, generateOptions?.settings, options?.settings),
      run: options?.run,
    });
  };
}
