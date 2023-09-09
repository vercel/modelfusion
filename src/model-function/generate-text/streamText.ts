import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../../core/FunctionEventSource.js";
import { getGlobalFunctionLogging } from "../../core/GlobalFunctionLogging.js";
import { getGlobalFunctionObservers } from "../../core/GlobalFunctionObservers.js";
import { getFunctionCallLogger } from "../../core/getFunctionCallLogger.js";
import { startDurationMeasurement } from "../../util/DurationMeasurement.js";
import { AbortError } from "../../core/api/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelCallMetadata } from "../executeCall.js";
import { DeltaEvent } from "./DeltaEvent.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";
import {
  TextStreamingFinishedEvent,
  TextStreamingStartedEvent,
} from "./TextStreamingEvent.js";
import { extractTextDeltas } from "./extractTextDeltas.js";

export class StreamTextPromise extends Promise<AsyncIterable<string>> {
  private outputPromise: Promise<AsyncIterable<string>>;

  constructor(
    private fullPromise: Promise<{
      output: AsyncIterable<string>;
      metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
    }>
  ) {
    super((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(null as any); // we override the resolve function
    });

    this.outputPromise = fullPromise.then((result) => result.output);
  }

  asFullResponse(): Promise<{
    output: AsyncIterable<string>;
    metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
  }> {
    return this.fullPromise;
  }

  override then<TResult1 = AsyncIterable<string>, TResult2 = never>(
    onfulfilled?:
      | ((value: AsyncIterable<string>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.outputPromise.then(onfulfilled, onrejected);
  }

  override catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<AsyncIterable<string> | TResult> {
    return this.outputPromise.catch(onrejected);
  }

  override finally(
    onfinally?: (() => void) | undefined | null
  ): Promise<AsyncIterable<string>> {
    return this.outputPromise.finally(onfinally);
  }
}

export function streamText<
  PROMPT,
  FULL_DELTA,
  SETTINGS extends TextGenerationModelSettings,
>(
  model: TextGenerationModel<PROMPT, unknown, FULL_DELTA, SETTINGS> & {
    generateDeltaStreamResponse: (
      prompt: PROMPT,
      options: ModelFunctionOptions<SETTINGS>
    ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;
    extractTextDelta: (fullDelta: FULL_DELTA) => string | undefined;
  },
  prompt: PROMPT,
  options?: ModelFunctionOptions<SETTINGS>
): StreamTextPromise {
  return new StreamTextPromise(doStreamText(model, prompt, options));
}

async function doStreamText<
  PROMPT,
  FULL_DELTA,
  SETTINGS extends TextGenerationModelSettings,
>(
  model: TextGenerationModel<PROMPT, unknown, FULL_DELTA, SETTINGS> & {
    generateDeltaStreamResponse: (
      prompt: PROMPT,
      options: ModelFunctionOptions<SETTINGS>
    ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;
    extractTextDelta: (fullDelta: FULL_DELTA) => string | undefined;
  },
  prompt: PROMPT,
  options?: ModelFunctionOptions<SETTINGS>
): Promise<{
  output: AsyncIterable<string>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}> {
  if (options?.settings != null) {
    model = model.withSettings(options.settings);
    options = {
      functionId: options.functionId,
      observers: options.observers,
      run: options.run,
    };
  }

  const run = options?.run;
  const settings = model.settings;

  const eventSource = new FunctionEventSource({
    observers: [
      ...getFunctionCallLogger(options?.logging ?? getGlobalFunctionLogging()),
      ...getGlobalFunctionObservers(),
      ...(settings.observers ?? []),
      ...(run?.functionObserver != null ? [run.functionObserver] : []),
      ...(options?.observers ?? []),
    ],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    functionType: "text-streaming" as const,

    callId: `call-${createId()}`,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,

    model: model.modelInformation,
    settings: model.settingsForEvent,
    input: prompt,

    timestamp: durationMeasurement.startDate,
    startTimestamp: durationMeasurement.startDate,
  };

  eventSource.notify({
    eventType: "started",
    ...startMetadata,
  } satisfies TextStreamingStartedEvent);

  const result = await runSafe(async () =>
    extractTextDeltas({
      deltaIterable: await model.generateDeltaStreamResponse(prompt, {
        functionId: options?.functionId,
        settings, // options.setting is null here because of the initial guard
        run,
      }),
      extractDelta: (fullDelta) => model.extractTextDelta(fullDelta),
      onDone: (fullText, lastFullDelta) => {
        const finishMetadata = {
          eventType: "finished" as const,
          ...startMetadata,
          finishTimestamp: new Date(),
          durationInMs: durationMeasurement.durationInMs,
        };

        eventSource.notify({
          ...finishMetadata,
          result: {
            status: "success",
            response: lastFullDelta,
            output: fullText,
          },
        } satisfies TextStreamingFinishedEvent);
      },
      onError: (error) => {
        const finishMetadata = {
          eventType: "finished" as const,
          ...startMetadata,
          finishTimestamp: new Date(),
          durationInMs: durationMeasurement.durationInMs,
        };

        eventSource.notify(
          error instanceof AbortError
            ? {
                ...finishMetadata,
                result: {
                  status: "abort",
                },
              }
            : {
                ...finishMetadata,
                result: {
                  status: "error",
                  error,
                },
              }
        );
      },
    })
  );

  if (!result.ok) {
    const finishMetadata = {
      eventType: "finished" as const,
      ...startMetadata,
      finishTimestamp: new Date(),
      durationInMs: durationMeasurement.durationInMs,
    };

    if (result.isAborted) {
      eventSource.notify({
        ...finishMetadata,
        result: {
          status: "abort",
        },
      });
      throw new AbortError();
    }

    eventSource.notify({
      ...finishMetadata,
      result: {
        status: "error",
        error: result.error,
      },
    });
    throw result.error;
  }

  return {
    output: result.output,
    metadata: startMetadata,
  };
}
