import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Schema } from "../../core/schema/Schema.js";
import { Delta } from "../../model-function/Delta.js";
import { Model, ModelSettings } from "../Model.js";

export interface StructureGenerationModelSettings extends ModelSettings {}

export interface StructureGenerationModel<
  PROMPT,
  SETTINGS extends
    StructureGenerationModelSettings = StructureGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateStructure(
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

export interface StructureStreamingModel<
  PROMPT,
  SETTINGS extends
    StructureGenerationModelSettings = StructureGenerationModelSettings,
> extends StructureGenerationModel<PROMPT, SETTINGS> {
  doStreamStructure(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<AsyncIterable<Delta<unknown>>>;

  extractStructureTextDelta(delta: unknown): string | undefined;

  parseAccumulatedStructureText(accumulatedText: string): unknown;
}
