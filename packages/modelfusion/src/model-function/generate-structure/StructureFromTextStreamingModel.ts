import { FunctionOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { Delta } from "../../model-function/Delta.js";
import { streamText } from "../../model-function/generate-text/streamText.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "../generate-text/TextGenerationModel.js";
import { generateText } from "../generate-text/generateText.js";
import { StructureFromTextGenerationModel } from "./StructureFromTextGenerationModel.js";
import { StructureFromTextPromptTemplate } from "./StructureFromTextPromptTemplate.js";
import { StructureStreamingModel } from "./StructureGenerationModel.js";
import { StructureParseError } from "./StructureParseError.js";
import { parsePartialJson } from "./parsePartialJson.js";

export class StructureFromTextStreamingModel<
    SOURCE_PROMPT,
    TARGET_PROMPT,
    MODEL extends TextStreamingModel<
      TARGET_PROMPT,
      TextGenerationModelSettings
    >,
  >
  extends StructureFromTextGenerationModel<SOURCE_PROMPT, TARGET_PROMPT, MODEL>
  implements StructureStreamingModel<SOURCE_PROMPT, MODEL["settings"]>
{
  constructor(options: {
    model: MODEL;
    template: StructureFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>;
  }) {
    super(options);
  }

  async doGenerateStructure(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const { rawResponse: response, text } = await generateText(
      this.model,
      this.template.createPrompt(prompt, schema),
      {
        ...options,
        fullResponse: true,
      }
    );

    try {
      return {
        response,
        value: this.template.extractStructure(text),
        valueText: text,
      };
    } catch (error) {
      throw new StructureParseError({
        valueText: text,
        cause: error,
      });
    }
  }

  async doStreamStructure(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const textStream = await streamText(
      this.model,
      this.template.createPrompt(prompt, schema),
      options
    );

    const queue = new AsyncQueue<Delta<string>>();

    // run async on purpose:
    (async () => {
      try {
        for await (const deltaText of textStream) {
          queue.push({ type: "delta", deltaValue: deltaText });
        }
      } catch (error) {
        queue.push({ type: "error", error });
      } finally {
        queue.close();
      }
    })();

    return queue;
  }

  extractStructureTextDelta(delta: unknown): string {
    return delta as string;
  }

  parseAccumulatedStructureText(accumulatedText: string): unknown {
    return parsePartialJson(accumulatedText);
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new StructureFromTextStreamingModel({
      model: this.model.withSettings(additionalSettings),
      template: this.template,
    }) as this;
  }
}
