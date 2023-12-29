import * as mathjs from "mathjs";
import { Tool, zodSchema } from "modelfusion";
import { z } from "zod";
const DEFAULT_DESCRIPTION = "A tool for evaluating mathematical expressions. Example expressions: " +
    "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.";
/**
 * A tool for evaluating mathematical expressions.
 *
 * @see https://mathjs.org/
 */
export class MathJsTool extends Tool {
    constructor(settings) {
        super({
            name: settings.name,
            description: settings.description ?? DEFAULT_DESCRIPTION,
            parameters: zodSchema(z.object({
                expression: z.string(),
            })),
            execute: async ({ expression }) => mathjs.evaluate(expression),
        });
        Object.defineProperty(this, "settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.settings = settings;
    }
}
