import { RunContext } from "../../run/RunContext.js";
import { SplitFunction } from "../split/SplitFunction.js";
import { SummarizationFunction } from "./SummarizationFunction.js";

export async function summarizeRecursively(
  {
    summarize,
    split,
    join = (texts) => texts.join("\n\n"),
    text,
  }: {
    summarize: SummarizationFunction;
    split: SplitFunction;
    join?: (texts: Array<string>) => string;
    text: string;
  },
  context?: RunContext
): Promise<string> {
  const chunks = await split({ text });

  const summarizedTexts = await Promise.all(
    chunks.map((chunk) => summarize({ text: chunk }, context))
  );

  if (summarizedTexts.length === 1) {
    return summarizedTexts[0]!;
  }

  // recursive mapping: will split joined results as needed to stay
  // within the allowed size limit of the splitter.
  return summarizeRecursively(
    {
      text: join(summarizedTexts),
      summarize,
      split,
      join,
    },
    context
  );
}

export const summarizeRecursivelyAsFunction =
  ({
    split,
    map,
    join,
  }: {
    split: SplitFunction;
    map: SummarizationFunction;
    join?: (texts: Array<string>) => string;
  }): SummarizationFunction =>
  async ({ text }, context?: RunContext) =>
    summarizeRecursively(
      {
        summarize: map,
        split,
        join,
        text,
      },
      context
    );
