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
  static readonly INPUT_SCHEMA = INPUT_SCHEMA;
  static readonly OUTPUT_SCHEMA = OUTPUT_SCHEMA;

  constructor(options: {
    name: NAME;
    description: string;
    execute(
      input: z.infer<typeof INPUT_SCHEMA>
    ): Promise<z.infer<typeof OUTPUT_SCHEMA>>;
  }) {
    super({
      name: options.name,
      description: options.description,
      inputSchema: INPUT_SCHEMA,
      outputSchema: OUTPUT_SCHEMA,
      execute: options.execute,
    });
  }
}
