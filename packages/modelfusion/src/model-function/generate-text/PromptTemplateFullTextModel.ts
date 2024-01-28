import { FunctionOptions } from "../../core/FunctionOptions";
import { ToolDefinition } from "../../tool/ToolDefinition";
import { ToolCallGenerationModel } from "../../tool/generate-tool-call/ToolCallGenerationModel";
import { ToolCallsGenerationModel } from "../../tool/generate-tool-calls/ToolCallsGenerationModel";
import { PromptTemplateTextStreamingModel } from "./PromptTemplateTextStreamingModel";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "./TextGenerationModel";
import { TextGenerationPromptTemplate } from "./TextGenerationPromptTemplate";

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

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptTemplateFullTextModel({
      model: this.model.withSettings(additionalSettings),
      promptTemplate: this.promptTemplate,
    }) as this;
  }
}
