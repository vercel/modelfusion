import { TextGenerationModelWithTokenization } from "../../model/text-generation/TextGenerationModel.js";
import { Run } from "../../run/Run.js";
import { splitRecursivelyAtTokenForModelAsSplitFunction } from "../split/splitRecursively.js";
import { SummarizationFunction } from "./SummarizationFunction.js";
import { summarizeRecursively } from "./summarizeRecursively.js";

/**
 * Recursively summarizes a text using a text generation model, e.g. for summarization or text extraction.
 * It automatically splits the text into optimal chunks that are small enough to be processed by the model,
 * while leaving enough space for the model to generate text.
 */
export async function summarizeRecursivelyWithTextGenerationAndTokenSplitting<
  PROMPT
>(
  {
    text,
    model,
    prompt,
    reservedCompletionTokens,
    join,
  }: {
    text: string;
    model: TextGenerationModelWithTokenization<PROMPT, any>;
    prompt: (input: { text: string }) => Promise<PROMPT>;
    reservedCompletionTokens: number;
    join?: (texts: Array<string>) => string;
  },
  options?: {
    functionId?: string;
    run?: Run;
  }
) {
  const functionId = options?.functionId;

  const emptyPromptTokens = await model.countPromptTokens(
    await prompt({ text: "" })
  );

  return summarizeRecursively(
    {
      split: splitRecursivelyAtTokenForModelAsSplitFunction({
        model,
        maxChunkSize:
          model.maxTokens - reservedCompletionTokens - emptyPromptTokens,
      }),
      summarize: model
        .withMaxTokens(reservedCompletionTokens)
        .generateTextAsFunction(prompt, { functionId }),
      join,
      text,
    },
    options
  );
}

export const summarizeRecursivelyWithTextGenerationAndTokenSplittingAsFunction =

    <PROMPT>({
      model,
      prompt,
      reservedCompletionTokens,
      join,
      functionId,
    }: {
      model: TextGenerationModelWithTokenization<PROMPT, any>;
      prompt: (input: { text: string }) => Promise<PROMPT>;
      reservedCompletionTokens: number;
      join?: (texts: Array<string>) => string;
      functionId?: string;
    }): SummarizationFunction =>
    async (
      input: { text: string },
      options?: {
        functionId?: string;
        run?: Run;
      }
    ) =>
      summarizeRecursivelyWithTextGenerationAndTokenSplitting(
        {
          text: input.text,
          model,
          prompt,
          reservedCompletionTokens,
          join,
        },
        {
          functionId: options?.functionId ?? functionId,
          run: options?.run,
        }
      );
