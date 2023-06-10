import { RunContext } from "../../run/RunContext.js";
import { TextGenerationModelWithTokenization } from "../../model/text-generation/TextGenerationModel.js";
import { splitRecursivelyAtTokenForModel } from "../split/splitRecursively.js";
import { SummarizeFunction } from "./SummarizeFunction.js";
import { summarizeRecursively } from "./summarizeRecursively.js";

/**
 * Recursively summarizes a text using a text generation model, e.g. for summarization or text extraction.
 * It automatically splits the text into chunks that are small enough to be processed by the model,
 * while leaving enough space for the model to generate text.
 */
export async function summarizeRecursivelyWithTextGenerationAndTokenSplitting<
  PROMPT
>(
  {
    text,
    model,
    prompt,
    functionId,
    reservedCompletionTokens,
  }: {
    text: string;
    model: TextGenerationModelWithTokenization<PROMPT, any>;
    prompt: (options: { text: string }) => Promise<PROMPT>;
    functionId?: string;
    reservedCompletionTokens: number;
  },
  context?: RunContext
) {
  return summarizeRecursively(
    {
      split: splitRecursivelyAtTokenForModel.asSplitFunction({
        model,
        maxChunkSize:
          model.maxTokens -
          reservedCompletionTokens -
          (await model.countPromptTokens(await prompt({ text: "" }))),
      }),
      summarize: model
        .withMaxTokens(reservedCompletionTokens)
        .generateTextAsFunction(prompt, { functionId }),
      text,
    },
    context
  );
}

summarizeRecursivelyWithTextGenerationAndTokenSplitting.asFunction =
  <PROMPT>({
    model,
    prompt,
    functionId,
    reservedCompletionTokens,
  }: {
    model: TextGenerationModelWithTokenization<PROMPT, any>;
    prompt: (options: { text: string }) => Promise<PROMPT>;
    functionId?: string;
    reservedCompletionTokens: number;
  }): SummarizeFunction =>
  async (options: { text: string }, context?: RunContext) =>
    summarizeRecursivelyWithTextGenerationAndTokenSplitting(
      {
        text: options.text,
        model,
        prompt,
        functionId,
        reservedCompletionTokens,
      },
      context
    );
