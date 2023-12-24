import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureFromTextPromptTemplate } from "../generate-structure/StructureFromTextPromptTemplate.js";
import { StructureFromTextStreamingModel } from "../generate-structure/StructureFromTextStreamingModel.js";
import { PromptTemplateTextGenerationModel } from "./PromptTemplateTextGenerationModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "./TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "./TextGenerationPromptTemplate.js";

export class PromptTemplateTextStreamingModel<
    PROMPT,
    MODEL_PROMPT,
    SETTINGS extends TextGenerationModelSettings,
    MODEL extends TextStreamingModel<MODEL_PROMPT, SETTINGS>,
  >
  extends PromptTemplateTextGenerationModel<
    PROMPT,
    MODEL_PROMPT,
    SETTINGS,
    MODEL
  >
  implements TextStreamingModel<PROMPT, SETTINGS>
{
  constructor(options: {
    model: MODEL;
    promptTemplate: TextGenerationPromptTemplate<PROMPT, MODEL_PROMPT>;
  }) {
    super(options);
  }

  doStreamText(prompt: PROMPT, options?: FunctionOptions) {
    const mappedPrompt = this.promptTemplate.format(prompt);
    return this.model.doStreamText(mappedPrompt, options);
  }

  extractTextDelta(delta: unknown): string {
    return this.model.extractTextDelta(delta);
  }

  asStructureGenerationModel<INPUT_PROMPT>(
    promptTemplate: StructureFromTextPromptTemplate<INPUT_PROMPT, PROMPT>
  ) {
    return new StructureFromTextStreamingModel({
      model: this,
      template: promptTemplate,
    });
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, PROMPT>
  ): PromptTemplateTextStreamingModel<INPUT_PROMPT, PROMPT, SETTINGS, this> {
    return new PromptTemplateTextStreamingModel<
      INPUT_PROMPT,
      PROMPT,
      SETTINGS,
      this
    >({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptTemplate.stopSequences,
        ],
      } as Partial<SETTINGS>),
      promptTemplate,
    });
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptTemplateTextStreamingModel({
      model: this.model.withSettings(additionalSettings),
      promptTemplate: this.promptTemplate,
    }) as this;
  }
}
