import { Run } from "../../run/Run.js";
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
  options?: { run?: Run }
): Promise<string> {
  const chunks = await split({ text });

  const summarizedTexts = await Promise.all(
    chunks.map((chunk) => summarize({ text: chunk }, options))
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
    options
  );
}
