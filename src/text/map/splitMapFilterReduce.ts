import { SplitFunction } from "text/split/SplitFunction.js";
import { MapFunction } from "./MapFunction.js";
import { RunContext } from "run/RunContext.js";

export const splitMapFilterReduce = async (
  {
    split,
    map,
    filter,
    reduce,
    join = (texts) => texts.join("\n\n"),
    text,
  }: {
    split: SplitFunction;
    map: MapFunction;
    filter: (text: string) => boolean;
    reduce: MapFunction;
    join?: (texts: Array<string>) => string;
    text: string;
  },
  context?: RunContext
) => {
  const chunks = await split({ text });

  const mappedTexts = [];
  for (const chunk of chunks) {
    const mappedText = await map({ text: chunk }, context);

    if (filter(mappedText)) {
      mappedTexts.push(mappedText);
    }
  }

  return reduce({ text: join(mappedTexts) }, context);
};

splitMapFilterReduce.asMapFunction =
  ({
    split,
    map,
    filter,
    reduce,
  }: {
    split: SplitFunction;
    map: MapFunction;
    filter: (text: string) => boolean;
    reduce: MapFunction;
  }): MapFunction =>
  async ({ text }, context?: RunContext) =>
    splitMapFilterReduce(
      {
        split,
        map,
        filter,
        reduce,
        text,
      },
      context
    );
