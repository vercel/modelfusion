import { z } from "zod";
import { FunctionOptions } from "../run/FunctionOptions.js";
import { Tool } from "./Tool.js";

const OUTPUT_SCHEMA = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      link: z.string().url(),
      snippet: z.string(),
    })
  ),
});

// expose the schemas to library consumers:
const createInputSchema = (description: string) =>
  // same structure, but with description:
  z.object({
    query: z.string().describe(description),
  });

export type WebSearchToolInput = {
  query: string;
};

export type WebSearchToolOutput = {
  results: {
    title: string;
    link: string;
    snippet: string;
  }[];
};

export class WebSearchTool<NAME extends string> extends Tool<
  NAME,
  WebSearchToolInput,
  WebSearchToolOutput
> {
  constructor({
    name,
    description,
    queryDescription = "Search query",
    execute,
  }: {
    name: NAME;
    description: string;
    queryDescription?: string;
    execute(
      input: WebSearchToolInput,
      options?: FunctionOptions
    ): PromiseLike<WebSearchToolOutput>;
  }) {
    super({
      name,
      description,
      inputSchema: createInputSchema(queryDescription),
      outputSchema: OUTPUT_SCHEMA,
      execute,
    });
  }
}
