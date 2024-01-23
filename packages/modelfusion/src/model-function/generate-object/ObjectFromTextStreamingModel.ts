import { FunctionOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { Delta } from "../Delta.js";
import { streamText } from "../generate-text/streamText.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parsePartialJson } from "../../util/parsePartialJson.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "../generate-text/TextGenerationModel.js";
import { ObjectFromTextGenerationModel } from "./ObjectFromTextGenerationModel.js";
import { ObjectFromTextPromptTemplate } from "./ObjectFromTextPromptTemplate.js";
import { ObjectStreamingModel } from "./ObjectGenerationModel.js";

export class ObjectFromTextStreamingModel<
    SOURCE_PROMPT,
    TARGET_PROMPT,
    MODEL extends TextStreamingModel<
      TARGET_PROMPT,
      TextGenerationModelSettings
    >,
  >
  extends ObjectFromTextGenerationModel<SOURCE_PROMPT, TARGET_PROMPT, MODEL>
  implements ObjectStreamingModel<SOURCE_PROMPT, MODEL["settings"]>
{
  constructor(options: {
    model: MODEL;
    template: ObjectFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>;
  }) {
    super(options);
  }

  async doStreamObject(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const textStream = await streamText({
      model: this.getModelWithJsonOutput(schema),
      prompt: this.template.createPrompt(prompt, schema),
      ...options,
    });

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

  extractObjectTextDelta(delta: unknown): string {
    return delta as string;
  }

  parseAccumulatedObjectText(accumulatedText: string): unknown {
    return parsePartialJson(accumulatedText);
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new ObjectFromTextStreamingModel({
      model: this.model.withSettings(additionalSettings),
      template: this.template,
    }) as this;
  }
}
