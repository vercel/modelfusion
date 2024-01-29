import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer";
import { FunctionOptions } from "../../core/FunctionOptions";
import { Schema } from "../../core/schema/Schema";
import { Delta } from "../Delta";
import { Model, ModelSettings } from "../Model";

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
