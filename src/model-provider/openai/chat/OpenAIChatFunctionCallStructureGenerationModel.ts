import SecureJSON from "secure-json-parse";
import { FunctionOptions } from "../../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../../core/schema/Schema.js";
import { StructureGenerationModel } from "../../../model-function/generate-structure/StructureGenerationModel.js";
import { StructureParseError } from "../../../model-function/generate-structure/StructureParseError.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage";
import {
  OpenAIChatModel,
  OpenAIChatResponseFormat,
  OpenAIChatSettings,
} from "./OpenAIChatModel";

export class OpenAIChatFunctionCallStructureGenerationModel
  implements StructureGenerationModel<OpenAIChatMessage[], OpenAIChatSettings>
{
  readonly model: OpenAIChatModel;
  readonly fnName: string;
  readonly fnDescription?: string;

  constructor({
    model,
    fnName,
    fnDescription,
  }: {
    model: OpenAIChatModel;
    fnName: string;
    fnDescription?: string;
  }) {
    this.model = model;
    this.fnName = fnName;
    this.fnDescription = fnDescription;
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

  withSettings(additionalSettings: Partial<OpenAIChatSettings>) {
    return new OpenAIChatFunctionCallStructureGenerationModel({
      model: this.model.withSettings(additionalSettings),
      fnName: this.fnName,
      fnDescription: this.fnDescription,
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
    prompt: OpenAIChatMessage[],
    options?: FunctionOptions
  ) {
    const response = await this.model.callAPI(prompt, {
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
