import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ToolDefinition } from "../../tool/ToolDefinition.js";
import { ToolCallGenerationModel } from "../../tool/generate-tool-call/ToolCallGenerationModel.js";
import { ToolCallsGenerationModel } from "../../tool/generate-tool-calls/ToolCallsGenerationModel.js";
import { PromptTemplateTextStreamingModel } from "./PromptTemplateTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "./TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "./TextGenerationPromptTemplate.js";

export class PromptTemplateFullTextModel<
    PROMPT,
    MODEL_PROMPT,
    SETTINGS extends TextGenerationModelSettings,
    MODEL extends TextStreamingModel<MODEL_PROMPT, SETTINGS> &
      ToolCallGenerationModel<MODEL_PROMPT, SETTINGS> &
      ToolCallsGenerationModel<MODEL_PROMPT, SETTINGS>,
  >
  extends PromptTemplateTextStreamingModel<
    PROMPT,
    MODEL_PROMPT,
    SETTINGS,
    MODEL
  >
  implements
    TextStreamingModel<PROMPT, SETTINGS>,
    ToolCallGenerationModel<PROMPT, SETTINGS>,
    ToolCallsGenerationModel<PROMPT, SETTINGS>
{
  constructor(options: {
    model: MODEL;
    promptTemplate: TextGenerationPromptTemplate<PROMPT, MODEL_PROMPT>;
  }) {
    super(options);
  }

  doGenerateToolCall(
    tool: ToolDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions | undefined
  ): PromiseLike<{
    rawResponse: unknown;
    toolCall: { id: string; args: unknown } | null;
    usage?:
      | { promptTokens: number; completionTokens: number; totalTokens: number }
      | undefined;
  }> {
    const mappedPrompt = this.promptTemplate.format(prompt);
    return this.model.doGenerateToolCall(tool, mappedPrompt, options);
  }

  doGenerateToolCalls(
    tools: ToolDefinition<string, unknown>[],
    prompt: PROMPT,
    options?: FunctionOptions | undefined
  ): PromiseLike<{
    rawResponse: unknown;
    text: string | null;
    toolCalls: { id: string; name: string; args: unknown }[] | null;
    usage?:
      | { promptTokens: number; completionTokens: number; totalTokens: number }
      | undefined;
  }> {
    const mappedPrompt = this.promptTemplate.format(prompt);
    return this.model.doGenerateToolCalls(tools, mappedPrompt, options);
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, PROMPT>
  ): PromptTemplateFullTextModel<INPUT_PROMPT, PROMPT, SETTINGS, this> {
    return new PromptTemplateFullTextModel<
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
    return new PromptTemplateFullTextModel({
      model: this.model.withSettings(additionalSettings),
      promptTemplate: this.promptTemplate,
    }) as this;
  }
}
