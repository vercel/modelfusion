import SecureJSON from "secure-json-parse";
import { FunctionOptions } from "../../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../../core/schema/Schema.js";
import { StructureGenerationModel } from "../../../model-function/generate-structure/StructureGenerationModel.js";
import { StructureParseError } from "../../../model-function/generate-structure/StructureParseError.js";
import { TextGenerationPromptFormat } from "../../../model-function/generate-text/TextGenerationPromptFormat.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage";
import {
  OpenAIChatModel,
  OpenAIChatResponseFormat,
  OpenAIChatSettings,
} from "./OpenAIChatModel";
import { chat, instruction, text } from "./OpenAIChatPromptFormat.js";

export class OpenAIChatFunctionCallStructureGenerationModel<
  PROMPT_FORMAT extends TextGenerationPromptFormat<
    unknown,
    OpenAIChatMessage[]
  >,
> implements StructureGenerationModel<OpenAIChatMessage[], OpenAIChatSettings>
{
  readonly model: OpenAIChatModel;
  readonly fnName: string;
  readonly fnDescription?: string;
  readonly promptFormat: PROMPT_FORMAT;

  constructor({
    model,
    fnName,
    fnDescription,
    promptFormat,
  }: {
    model: OpenAIChatModel;
    fnName: string;
    fnDescription?: string;
    promptFormat: PROMPT_FORMAT;
  }) {
    this.model = model;
    this.fnName = fnName;
    this.fnDescription = fnDescription;
    this.promptFormat = promptFormat;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  get settingsForEvent() {
    return this.model.settingsForEvent;
  }

  /**
   * Returns this model with a text prompt format.
   */
  withTextPrompt() {
    return this.withPromptFormat(text());
  }

  /**
   * Returns this model with an instruction prompt format.
   */
  withInstructionPrompt() {
    return this.withPromptFormat(instruction());
  }

  /**
   * Returns this model with a chat prompt format.
   */
  withChatPrompt() {
    return this.withPromptFormat(chat());
  }

  withPromptFormat<
    TARGET_PROMPT_FORMAT extends TextGenerationPromptFormat<
      unknown,
      OpenAIChatMessage[]
    >,
  >(
    promptFormat: TARGET_PROMPT_FORMAT
  ): OpenAIChatFunctionCallStructureGenerationModel<TARGET_PROMPT_FORMAT> {
    return new OpenAIChatFunctionCallStructureGenerationModel({
      model: this.model,
      fnName: this.fnName,
      fnDescription: this.fnDescription,
      promptFormat,
    });
  }

  withSettings(additionalSettings: Partial<OpenAIChatSettings>) {
    return new OpenAIChatFunctionCallStructureGenerationModel({
      model: this.model.withSettings(additionalSettings),
      fnName: this.fnName,
      fnDescription: this.fnDescription,
      promptFormat: this.promptFormat,
    }) as this;
  }

  /**
   * JSON generation uses the OpenAI GPT function calling API.
   * It provides a single function specification and instructs the model to provide parameters for calling the function.
   * The result is returned as parsed JSON.
   *
   * @see https://platform.openai.com/docs/guides/gpt/function-calling
   */
  async doGenerateStructure(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: Parameters<PROMPT_FORMAT["format"]>[0], // first argument of the function
    options?: FunctionOptions
  ) {
    const expandedPrompt = this.promptFormat.format(prompt);

    const response = await this.model
      .withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...this.promptFormat.stopSequences,
        ],
      })
      .callAPI(expandedPrompt, {
        ...options,
        responseFormat: OpenAIChatResponseFormat.json,
        functionCall: { name: this.fnName },
        functions: [
          {
            name: this.fnName,
            description: this.fnDescription,
            parameters: schema.getJsonSchema(),
          },
        ],
      });

    const valueText = response.choices[0]!.message.function_call!.arguments;

    try {
      return {
        response,
        valueText,
        value: SecureJSON.parse(valueText),
        usage: this.model.extractUsage(response),
      };
    } catch (error) {
      throw new StructureParseError({
        valueText,
        cause: error,
      });
    }
  }

  async doStreamStructure(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: OpenAIChatMessage[],
    options?: FunctionOptions
  ) {
    return this.model.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.structureDeltaIterable,
      functionCall: { name: this.fnName },
      functions: [
        {
          name: this.fnName,
          description: this.fnDescription,
          parameters: schema.getJsonSchema(),
        },
      ],
    });
  }
}
