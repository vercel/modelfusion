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

    const queue = new AsyncQueue<Delta<unknown>>();

    // run async on purpose:
    (async () => {
      try {
        let fullText = "";
        for await (const deltaText of textStream) {
          fullText += deltaText;

          const deltaStructure = parsePartialJson(fullText);

          // only publish parsable structures
          if (deltaStructure != null) {
            queue.push({
              type: "delta",
              fullDelta: fullText,
              valueDelta: deltaStructure,
            });
          }
        }
      } catch (error) {
        queue.push({ type: "error", error });
      } finally {
        queue.close();
      }
    })();

    return queue;
  }

  async doGenerateStructure(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const { response, value } = await generateText(
      this.model,
      this.template.createPrompt(prompt, schema),
      {
        ...options,
        returnType: "full",
      }
    );

    try {
      return {
        response,
        value: this.template.extractStructure(value),
        valueText: value,
      };
    } catch (error) {
      throw new StructureParseError({
        valueText: value,
        cause: error,
      });
    }
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new StructureFromTextStreamingModel({
      model: this.model.withSettings(additionalSettings),
      template: this.template,
    }) as this;
  }
}
