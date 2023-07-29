import { FunctionOptions } from "../FunctionOptions.js";
import { ModelSettings } from "../Model.js";
import { TextPromptModel } from "../TextPromptModel.js";
import { DeltaEvent } from "./DeltaEvent.js";

export interface TextGenerationModelSettings extends ModelSettings {
  trimOutput?: boolean;
}

export interface TextGenerationModel<
  PROMPT,
  RESPONSE,
  FULL_DELTA,
  SETTINGS extends TextGenerationModelSettings,
> extends TextPromptModel<PROMPT, SETTINGS> {
  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractText(response: RESPONSE): string;

  readonly generateDeltaStreamResponse:
    | ((
        prompt: PROMPT,
        options: FunctionOptions<SETTINGS>
      ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>)
    | undefined;

  readonly extractTextDelta:
    | ((fullDelta: FULL_DELTA) => string | undefined)
    | undefined;
}
