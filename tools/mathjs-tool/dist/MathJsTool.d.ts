import { Tool } from "modelfusion";
export type MathJsToolSettings<NAME extends string> = {
    name: NAME;
    description?: string;
};
/**
 * A tool for evaluating mathematical expressions.
 *
 * @see https://mathjs.org/
 */
export declare class MathJsTool<NAME extends string> extends Tool<NAME, {
    expression: string;
}, string> {
    readonly settings: MathJsToolSettings<NAME>;
    constructor(settings: MathJsToolSettings<NAME>);
}
