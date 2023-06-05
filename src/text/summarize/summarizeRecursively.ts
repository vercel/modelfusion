import { RunContext } from "../../run/RunContext.js";
import { SplitFunction } from "../split/SplitFunction.js";
import { SummarizeFunction } from "./SummarizeFunction.js";

export async function summarizeRecursively(
  {
    summarize,
    split,
    join = (texts) => texts.join("\n\n"),
    text,
  }: {
    summarize: SummarizeFunction;
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

summarizeRecursively.asFunction =
  ({
    split,
    map,
    join,
  }: {
    split: SplitFunction;
    map: SummarizeFunction;
    join?: (texts: Array<string>) => string;
  }): SummarizeFunction =>
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
