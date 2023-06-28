import { nanoid as createId } from "nanoid";
import { ModelInformation } from "../run/ModelInformation.js";
import { RunObserver } from "../run/RunObserver.js";
import { ErrorHandler } from "../util/ErrorHandler.js";
import { AbortError } from "../util/api/AbortError.js";
import { runSafe } from "../util/runSafe.js";
import { FunctionOptions } from "./FunctionOptions.js";
import { Model, ModelSettings } from "./Model.js";

export async function executeCall<
  SETTINGS extends ModelSettings,
  MODEL extends Model<SETTINGS>,
  OUTPUT,
  RESPONSE
>({
  model,
  options,
  callModel,
  notifyObserverAboutStart,
  notifyObserverAboutAbort,
  notifyObserverAboutFailure,
  notifyObserverAboutSuccess,
  errorHandler,
  generateResponse,
  extractOutputValue,
}: {
  model: MODEL;
  options?: FunctionOptions<SETTINGS>;
  callModel: (
    model: MODEL,
    options: FunctionOptions<SETTINGS>
  ) => PromiseLike<OUTPUT>;
  notifyObserverAboutStart: (
    observer: RunObserver,
    startMetadata: {
      model: ModelInformation;
      runId?: string;
      sessionId?: string;
      startEpochSeconds: number;
    }
  ) => void;
  notifyObserverAboutAbort: (
    observer: RunObserver,
    metadata: {
      model: ModelInformation;
      runId?: string;
      sessionId?: string;
      startEpochSeconds: number;
      durationInMs: number;
    }
  ) => void;
  notifyObserverAboutFailure: (
    observer: RunObserver,
    metadata: {
      model: ModelInformation;
      runId?: string;
      sessionId?: string;
      startEpochSeconds: number;
      durationInMs: number;
    },
    error: unknown
  ) => void;
  notifyObserverAboutSuccess: (
    observer: RunObserver,
    metadata: {
      model: ModelInformation;
      runId?: string;
      sessionId?: string;
      startEpochSeconds: number;
      durationInMs: number;
    },
    output: OUTPUT
  ) => void;
  errorHandler: ErrorHandler;
  generateResponse: (
    options: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;
  extractOutputValue: (response: RESPONSE) => OUTPUT;
}): Promise<OUTPUT> {
  if (options?.settings != null) {
    return callModel(model.withSettings(options.settings), {
      functionId: options.functionId,
      run: options.run,
    });
  }

  const run = options?.run;

  const notifyObservers = (observerMethod: (observer: RunObserver) => void) => {
    const observers = [
      ...(model.settings.observers ?? []),
      ...(run?.observers ?? []),
    ];

    observers.forEach((observer) => {
      try {
        observerMethod(observer);
      } catch (error) {
        errorHandler(error);
      }
    });
  };
  const startTime = performance.now();
  const startEpochSeconds = Math.floor(
    (performance.timeOrigin + startTime) / 1000
  );

  const callId = createId();

  const startMetadata = {
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,

    functionId: options?.functionId,
    callId,

    model: model.modelInformation,

    startEpochSeconds,
  };

  notifyObservers((observer) =>
    notifyObserverAboutStart(observer, startMetadata)
  );

  const result = await runSafe(() =>
    generateResponse({
      functionId: options?.functionId,
      settings: model.settings, // options.setting is null here
      run,
    })
  );

  const generationDurationInMs = Math.ceil(performance.now() - startTime);

  const metadata = {
    durationInMs: generationDurationInMs,
    ...startMetadata,
  };

  if (!result.ok) {
    if (result.isAborted) {
      notifyObservers((observer) =>
        notifyObserverAboutAbort(observer, metadata)
      );

      throw new AbortError();
    }

    notifyObservers((observer) =>
      notifyObserverAboutFailure(observer, metadata, result.error)
    );

    throw result.error;
  }

  const output = extractOutputValue(result.output);

  notifyObservers((observer) =>
    notifyObserverAboutSuccess(observer, metadata, output)
  );

  return output;
}
