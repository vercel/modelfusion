import { FunctionOptions } from "../../core/FunctionOptions.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { executeStreamCall } from "../executeStreamCall.js";
import { TextStreamingModel } from "./TextGenerationModel.js";

export function streamText<PROMPT>(
  model: TextStreamingModel<PROMPT>,
  prompt: PROMPT,
  options?: FunctionOptions
): AsyncIterableResultPromise<string> {
  let accumulatedText = "";
  let lastFullDelta: unknown | undefined;

  return new AsyncIterableResultPromise<string>(
    executeStreamCall({
      functionType: "text-streaming",
      input: prompt,
      model,
      options,
      startStream: async (options) => model.doStreamText(prompt, options),
      processDelta: (delta) => {
        lastFullDelta = delta.fullDelta;

        const textDelta = delta.valueDelta;

        if (textDelta != null && textDelta.length > 0) {
          accumulatedText += textDelta;
          return textDelta;
        }

        return undefined;
      },
      getResult: () => ({
        response: lastFullDelta,
        value: accumulatedText,
      }),
    })
  );
}
