import { RunObserver } from "../../run/RunObserver.js";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";
import { TokenizationSupport } from "../tokenize/TokenizationSupport.js";

export type BaseTextGenerationModelSettings = {
  uncaughtErrorHandler?: (error: unknown) => void;
  observers?: Array<RunObserver>;

  trimOutput?: boolean;
};

export interface TextGenerationModel<
  PROMPT,
  SETTINGS extends BaseTextGenerationModelSettings
> {
  generateText(
    prompt: PROMPT,
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    }
  ): PromiseLike<string>;
  generateText(
    prompt: PROMPT,
    settings:
      | (Partial<SETTINGS> & {
          functionId?: string;
        })
      | null, // require explicit null when run is set
    run: RunContext
  ): PromiseLike<string>;

  generateTextAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    }
  ): (input: INPUT, run?: RunContext) => PromiseLike<string>;

  withSettings(additionalSettings: Partial<SETTINGS>): this;
}

export interface TextGenerationModelWithTokenization<
  PROMPT,
  SETTINGS extends BaseTextGenerationModelSettings
> extends TextGenerationModel<PROMPT, SETTINGS>,
    TokenizationSupport {
  countPromptTokens(prompt: PROMPT): PromiseLike<number>;
  withMaxTokens(
    maxTokens: number
  ): TextGenerationModelWithTokenization<PROMPT, SETTINGS>;
}
