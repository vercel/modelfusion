import { z } from "zod";
import { FunctionOptions } from "../core/FunctionOptions.js";
import { zodSchema } from "../core/schema/ZodSchema.js";
import { Tool } from "./Tool.js";

const RETURN_TYPE_SCHEMA = zodSchema(
  z.object({
    results: z.array(
      z.object({
        title: z.string(),
        link: z.string().url(),
        snippet: z.string(),
      })
    ),
  })
);

// expose the schemas to library consumers:
const createParameters = (description: string) =>
  // same structure, but with description:
  zodSchema(
    z.object({
      query: z.string().describe(description),
    })
  );

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

/**
 * A tool for searching the web.
 *
 * The input schema takes a query string.
 * ```ts
 * {
 *   query: "How many people live in Berlin?"
 * }
 * ```
 *
 * The output schema is an array of search results with title, link and snippet.
 * ```ts
 * {
 *  results:
 *   [
 *     {
 *       title: "Berlin - Wikipedia",
 *       link: "https://en.wikipedia.org/wiki/Berlin",
 *       snippet: "Berlin is the capital and largest city of Germany by...",
 *     },
 *     ...
 *   ]
 * }
 * ```
 */
export class WebSearchTool<NAME extends string> extends Tool<
  NAME,
  WebSearchToolInput,
  WebSearchToolOutput
> {
  // output schema is always available
  declare readonly returnType: typeof RETURN_TYPE_SCHEMA;

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
      parameters: createParameters(queryDescription),
      returnType: RETURN_TYPE_SCHEMA,
      execute,
    });
  }
}
