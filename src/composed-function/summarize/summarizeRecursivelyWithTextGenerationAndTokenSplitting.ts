import {
  TextGenerationModelSettings,
  TextGenerationModelWithTokenization,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { Run } from "../../run/Run.js";
import { splitRecursivelyAtTokenAsSplitFunction } from "../../text-chunk/split/splitRecursively.js";
import { summarizeRecursively } from "./summarizeRecursively.js";

/**
 * Recursively summarizes a text using a text generation model, e.g. for summarization or text extraction.
 * It automatically splits the text into optimal chunks that are small enough to be processed by the model,
 * while leaving enough space for the model to generate text.
 */
export async function summarizeRecursivelyWithTextGenerationAndTokenSplitting<
  PROMPT,
>(
  {
    text,
    model,
    prompt,
    reservedCompletionTokens,
    join,
  }: {
    text: string;
    model: TextGenerationModelWithTokenization<
      PROMPT,
      unknown,
      TextGenerationModelSettings
    > &
      FullTokenizer;
    prompt: (input: { text: string }) => Promise<PROMPT>;
    reservedCompletionTokens: number;
    join?: (texts: Array<string>) => string;
  },
  options?: {
    functionId?: string;
    run?: Run;
  }
) {
  const emptyPromptTokens = await model.countPromptTokens(
    await prompt({ text: "" })
  );

  return summarizeRecursively(
    {
      split: splitRecursivelyAtTokenAsSplitFunction({
        tokenizer: model,
        maxChunkSize:
          model.maxTokens - reservedCompletionTokens - emptyPromptTokens,
      }),
      summarize: async (input: { text: string }) =>
        generateText(
          model.withMaxTokens(reservedCompletionTokens),
          await prompt(input),
          options
        ),
      join,
      text,
    },
    options
  );
}
