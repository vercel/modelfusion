import { Run } from "../../core/Run.js";
import { TextGenerationModel } from "../../model-function/generate-text/TextGenerationModel.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { splitAtToken } from "../../text-chunk/split/splitRecursively.js";
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
    tokenLimit = model.contextWindowSize -
      (model.settings.maxCompletionTokens ?? model.contextWindowSize / 4),
    join,
  }: {
    text: string;
    model: TextGenerationModel<PROMPT> & {
      contextWindowSize: number;
      tokenizer: FullTokenizer;
      countPromptTokens: (prompt: PROMPT) => PromiseLike<number>;
    };
    prompt: (input: { text: string }) => Promise<PROMPT>;
    tokenLimit?: number;
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
      split: splitAtToken({
        tokenizer: model.tokenizer,
        maxTokensPerChunk: tokenLimit - emptyPromptTokens,
      }),
      summarize: async (input: { text: string }) =>
        generateText(model, await prompt(input), options),
      join,
      text,
    },
    options
  );
}
