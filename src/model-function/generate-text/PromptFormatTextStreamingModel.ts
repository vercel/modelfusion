import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureFromTextPromptFormat } from "model-function/generate-structure/StructureFromTextPromptFormat.js";
import { StructureFromTextStreamingModel } from "../../model-function/generate-structure/StructureFromTextStreamingModel.js";
import { PromptFormatTextGenerationModel } from "./PromptFormatTextGenerationModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "./TextGenerationModel.js";
import { TextGenerationPromptFormat } from "./TextGenerationPromptFormat.js";

export class PromptFormatTextStreamingModel<
    PROMPT,
    MODEL_PROMPT,
    SETTINGS extends TextGenerationModelSettings,
    MODEL extends TextStreamingModel<MODEL_PROMPT, SETTINGS>,
  >
  extends PromptFormatTextGenerationModel<PROMPT, MODEL_PROMPT, SETTINGS, MODEL>
  implements TextStreamingModel<PROMPT, SETTINGS>
{
  constructor(options: {
    model: MODEL;
    promptFormat: TextGenerationPromptFormat<PROMPT, MODEL_PROMPT>;
  }) {
    super(options);
  }

  doStreamText(prompt: PROMPT, options?: FunctionOptions) {
    const mappedPrompt = this.promptFormat.format(prompt);
    return this.model.doStreamText(mappedPrompt, options);
  }

  asStructureGenerationModel<INPUT_PROMPT>(
    promptFormat: StructureFromTextPromptFormat<INPUT_PROMPT, PROMPT>
  ) {
    return new StructureFromTextStreamingModel({
      model: this,
      format: promptFormat,
    });
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: TextGenerationPromptFormat<INPUT_PROMPT, PROMPT>
  ): PromptFormatTextStreamingModel<INPUT_PROMPT, PROMPT, SETTINGS, this> {
    return new PromptFormatTextStreamingModel<
      INPUT_PROMPT,
      PROMPT,
      SETTINGS,
      this
    >({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptFormat.stopSequences,
        ],
      } as Partial<SETTINGS>),
      promptFormat,
    });
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptFormatTextStreamingModel({
      model: this.model.withSettings(additionalSettings),
      promptFormat: this.promptFormat,
    }) as this;
  }
}
