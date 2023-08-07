import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { Run } from "../../run/Run.js";
import { splitRecursivelyAtToken } from "../../text-chunk/split/splitRecursively.js";
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
      (model.maxCompletionTokens ?? model.contextWindowSize / 4),
    join,
  }: {
    text: string;
    model: TextGenerationModel<
      PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      TextGenerationModelSettings
    > & {
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
      split: splitRecursivelyAtToken({
        tokenizer: model.tokenizer,
        maxChunkSize: tokenLimit - emptyPromptTokens,
      }),
      summarize: async (input: { text: string }) => {
        const { text } = await generateText(
          model,
          await prompt(input),
          options
        );
        return text;
      },
      join,
      text,
    },
    options
  );
}
