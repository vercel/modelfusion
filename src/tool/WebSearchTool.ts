import { z } from "zod";
import { Tool } from "./Tool.js";

const INPUT_SCHEMA = z.object({
  query: z.string(),
});

const OUTPUT_SCHEMA = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      link: z.string().url(),
      snippet: z.string(),
    })
  ),
});

export class WebSearchTool<NAME extends string> extends Tool<
  NAME,
  z.infer<typeof INPUT_SCHEMA>,
  z.infer<typeof OUTPUT_SCHEMA>
> {
  // expose the schemas to library consumers:
  static readonly createInputSchema = (description: string) =>
    // same structure, but with description:
    z.object({
      query: z.string().describe(description),
    });
  static readonly createOutputSchema = () => OUTPUT_SCHEMA;

  readonly outputSchema: typeof OUTPUT_SCHEMA;

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
      input: z.infer<typeof INPUT_SCHEMA>
    ): Promise<z.infer<typeof OUTPUT_SCHEMA>>;
  }) {
    super({
      name,
      description,
      inputSchema: WebSearchTool.createInputSchema(queryDescription),
      outputSchema: OUTPUT_SCHEMA,
      execute,
    });

    this.outputSchema = OUTPUT_SCHEMA;
  }
}
