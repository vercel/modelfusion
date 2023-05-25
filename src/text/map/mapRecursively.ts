import { RunContext } from "../../run/RunContext.js";
import { SplitFunction } from "../split/index.js";
import { MapFunction } from "./MapFunction.js";

export async function mapRecursively(
  {
    map,
    split,
    join = (texts) => texts.join("\n\n"),
    text,
  }: {
    map: MapFunction;
    split: SplitFunction;
    join?: (texts: Array<string>) => string;
    text: string;
  },
  context?: RunContext
): Promise<string> {
  const chunks = await split({ text });

  const mappedTexts = [];
  for (const chunk of chunks) {
    mappedTexts.push(await map({ text: chunk }, context));
  }

  if (mappedTexts.length === 1) {
    return mappedTexts[0]!;
  }

  // recursive mapping: will split joined results as needed to stay
  // within the allowed size limit of the splitter.
  return mapRecursively(
    {
      text: join(mappedTexts),
      map,
      split,
      join,
    },
    context
  );
}

mapRecursively.asMapFunction =
  ({
    split,
    map,
    join,
  }: {
    split: SplitFunction;
    map: MapFunction;
    join?: (texts: Array<string>) => string;
  }): MapFunction =>
  async ({ text }, context: RunContext) =>
    mapRecursively(
      {
        map,
        split,
        join,
        text,
      },
      context
    );
