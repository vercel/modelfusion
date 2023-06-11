import { Model, ModelSettings } from "../Model.js";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";
import { TokenizationSupport } from "../tokenization/TokenizationSupport.js";

export interface TextGenerationModelSettings extends ModelSettings {
  trimOutput?: boolean;
}

export interface TextGenerationModel<
  PROMPT,
  SETTINGS extends TextGenerationModelSettings
> extends Model<SETTINGS> {
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
}

export interface TextGenerationModelWithTokenization<
  PROMPT,
  SETTINGS extends TextGenerationModelSettings
> extends TextGenerationModel<PROMPT, SETTINGS>,
    TokenizationSupport {
  countPromptTokens(prompt: PROMPT): PromiseLike<number>;
  withMaxTokens(
    maxTokens: number
  ): TextGenerationModelWithTokenization<PROMPT, SETTINGS>;
}
