import { PromptTemplate } from "../../run/PromptTemplate.js";
import { AbortError } from "../../util/api/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { FunctionOptions } from "../FunctionOptions.js";
import {
  TextStreamingModel,
  TextStreamingModelSettings,
} from "./TextStreamingModel.js";

export async function streamText<
  PROMPT,
  SETTINGS extends TextStreamingModelSettings
>(
  model: TextStreamingModel<PROMPT, SETTINGS>,
  prompt: PROMPT,
  // format: TextStreamFormat<STREAM>,
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

  // const eventSource = new ModelCallEventSource({
  //   observers: [...(settings.observers ?? []), ...(run?.observers ?? [])],
  //   errorHandler: run?.errorHandler,
  // });

  // const startTime = performance.now();
  // const startEpochSeconds = Math.floor(
  //   (performance.timeOrigin + startTime) / 1000
  // );

  // const callId = `call-${createId()}`;

  // const startMetadata = {
  //   runId: run?.runId,
  //   sessionId: run?.sessionId,
  //   userId: run?.userId,
  //   functionId: options?.functionId,
  //   callId,
  //   model: model.modelInformation,
  //   startEpochSeconds,
  // };

  // eventSource.notifyModelCallStarted(getStartEvent(startMetadata, settings));

  const result = await runSafe(() =>
    model.generateTextStreamResponse(prompt, {
      functionId: options?.functionId,
      settings, // options.setting is null here because of the initial guard
      run,
    })
  );

  // const generationDurationInMs = Math.ceil(performance.now() - startTime);

  // const finishMetadata = {
  //   ...startMetadata,
  //   durationInMs: generationDurationInMs,
  // };

  if (!result.ok) {
    if (result.isAborted) {
      // eventSource.notifyModelCallFinished(
      //   getAbortEvent(finishMetadata, settings)
      // );
      throw new AbortError();
    }

    // eventSource.notifyModelCallFinished(
    //   getFailureEvent(finishMetadata, settings, result.error)
    // );
    throw result.error;
  }

  // const response = result.output;
  // const output = extractOutputValue(response);

  // eventSource.notifyModelCallFinished(
  //   getSuccessEvent(finishMetadata, settings, response, output)
  // );

  return result.output;
}

export function streamTextAsFunction<
  INPUT,
  PROMPT,
  SETTINGS extends TextStreamingModelSettings
>(
  model: TextStreamingModel<PROMPT, SETTINGS>,
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
