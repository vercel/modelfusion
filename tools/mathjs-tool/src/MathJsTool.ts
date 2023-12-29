import * as mathjs from "mathjs";
import { Tool, zodSchema } from "modelfusion";
import { z } from "zod";

const DEFAULT_DESCRIPTION =
  "A tool for evaluating mathematical expressions. Example expressions: " +
  "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.";

export type MathJsToolSettings<NAME extends string> = {
  name: NAME;
  description?: string;
};

/**
 * A tool for evaluating mathematical expressions.
 *
 * @see https://mathjs.org/
 */
export class MathJsTool<NAME extends string> extends Tool<
  NAME,
  { expression: string },
  string
> {
  readonly settings: MathJsToolSettings<NAME>;

  constructor(settings: MathJsToolSettings<NAME>) {
    super({
      name: settings.name,
      description: settings.description ?? DEFAULT_DESCRIPTION,
      parameters: zodSchema(
        z.object({
          expression: z.string(),
        })
      ),
      execute: async ({ expression }) => mathjs.evaluate(expression),
    });

    this.settings = settings;
  }
}
