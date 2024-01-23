import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Schema } from "../../core/schema/Schema.js";
import { Delta } from "../Delta.js";
import { Model, ModelSettings } from "../Model.js";

export interface ObjectGenerationModelSettings extends ModelSettings {}

export interface ObjectGenerationModel<
  PROMPT,
  SETTINGS extends
    ObjectGenerationModelSettings = ObjectGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateObject(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    rawResponse: unknown;
    valueText: string;
    value: unknown;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
}

export interface ObjectStreamingModel<
  PROMPT,
  SETTINGS extends
    ObjectGenerationModelSettings = ObjectGenerationModelSettings,
> extends ObjectGenerationModel<PROMPT, SETTINGS> {
  doStreamObject(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<AsyncIterable<Delta<unknown>>>;

  extractObjectTextDelta(delta: unknown): string | undefined;

  parseAccumulatedObjectText(accumulatedText: string): unknown;
}
