import { SplitFunction } from "../split/SplitFunction.js";
import { MapFunction } from "./MapFunction.js";
import { RunContext } from "../../run/RunContext.js";

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

  const mappedTexts = await Promise.all(
    chunks.map((chunk) => map({ text: chunk }, context))
  );

  return reduce({ text: join(mappedTexts.filter(filter)) }, context);
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
