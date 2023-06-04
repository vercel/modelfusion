import { RunContext } from "../../run/RunContext.js";
import { TextGenerationModelWithTokenization } from "../generate/TextGenerationModel.js";
import { generateText } from "../generate/generateText.js";
import { splitRecursivelyAtTokenForModel } from "../split/splitRecursively.js";
import { MapFunction } from "./MapFunction.js";
import { mapRecursively } from "./mapRecursively.js";

/**
 * Recursively maps a text using a text generation model, e.g. for summarization or text extraction.
 * It automatically splits the text into chunks that are small enough to be processed by the model,
 * while leaving enough space for the model to generate text.
 */
export async function mapRecursivelyWithTextGenerationAndTokenSplitting<PROMPT>(
  {
    text,
    model,
    mapPrompt,
    mapFunctionId,
    reservedCompletionTokens,
  }: {
    text: string;
    model: TextGenerationModelWithTokenization<PROMPT, any>;
    mapPrompt: (options: { text: string }) => Promise<PROMPT>;
    mapFunctionId?: string;
    reservedCompletionTokens: number;
  },
  context?: RunContext
) {
  return mapRecursively(
    {
      split: splitRecursivelyAtTokenForModel.asSplitFunction({
        model,
        maxChunkSize:
          model.maxTokens -
          reservedCompletionTokens -
          (await model.countPromptTokens(await mapPrompt({ text: "" }))),
      }),
      map: generateText.asFunction({
        functionId: mapFunctionId,
        model: model.withMaxTokens(reservedCompletionTokens),
        prompt: mapPrompt,
      }),
      text,
    },
    context
  );
}

mapRecursivelyWithTextGenerationAndTokenSplitting.asMapFunction =
  <PROMPT>({
    model,
    mapPrompt,
    mapFunctionId,
    reservedCompletionTokens,
  }: {
    model: TextGenerationModelWithTokenization<PROMPT, any>;
    mapPrompt: (options: { text: string }) => Promise<PROMPT>;
    mapFunctionId?: string;
    reservedCompletionTokens: number;
  }): MapFunction =>
  async (options: { text: string }, context?: RunContext) =>
    mapRecursivelyWithTextGenerationAndTokenSplitting(
      {
        text: options.text,
        model,
        mapPrompt,
        mapFunctionId,
        reservedCompletionTokens,
      },
      context
    );
