import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";
import { RunObserver } from "../../run/RunObserver.js";

export interface BaseImageGenerationModelSettings {
  uncaughtErrorHandler?: (error: unknown) => void;
  observers?: Array<RunObserver>;
}

export interface ImageGenerationModel<
  PROMPT,
  SETTINGS extends BaseImageGenerationModelSettings
> {
  generateImage(
    prompt: PROMPT,
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    }
  ): PromiseLike<string>;
  generateImage(
    prompt: PROMPT,
    settings:
      | (Partial<SETTINGS> & {
          functionId?: string;
        })
      | null, // require explicit null when run is set
    run: RunContext
  ): PromiseLike<string>;

  generateImageAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    }
  ): (input: INPUT, run?: RunContext) => PromiseLike<string>;

  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
