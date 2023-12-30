import { FunctionOptions } from "modelfusion";
import { executeFunctionCall } from "modelfusion/internal";

type OutputResult<INPUT, OUTPUT> =
  | {
      type: "value";
      input: INPUT;
      output: OUTPUT;
      error?: undefined;
    }
  | {
      type: "error";
      input: INPUT;
      output?: undefined;
      error: unknown;
    };

export type OutputValidator<INPUT, OUTPUT> = ({
  type,
  input,
  output,
  error,
}: OutputResult<INPUT, OUTPUT>) => PromiseLike<boolean>;

export type Guard<INPUT, OUTPUT> = ({
  type,
  input,
  output,
  error,
}: OutputResult<INPUT, OUTPUT>) => PromiseLike<
  | { action: "retry"; input: INPUT }
  | { action: "return"; output: OUTPUT }
  | { action: "throwError"; error: unknown }
  | { action: "passThrough" }
  | undefined
>;

export async function guard<INPUT, OUTPUT>(
  execute: (input: INPUT, options?: FunctionOptions) => PromiseLike<OUTPUT>,
  input: INPUT,
  guards: Guard<INPUT, OUTPUT> | Array<Guard<INPUT, OUTPUT>>,
  options?: FunctionOptions & { maxAttempts: number }
): Promise<OUTPUT | undefined> {
  const guardList = Array.isArray(guards) ? guards : [guards];
  const maxAttempts = options?.maxAttempts ?? 2;

  return executeFunctionCall({
    options,
    input,
    functionType: "extension",
    execute: async (options) => {
      let attempts = 0;
      while (attempts < maxAttempts) {
        let result: OutputResult<INPUT, OUTPUT>;

        try {
          result = {
            type: "value" as const,
            input,
            output: await execute(input, options),
          };
        } catch (error) {
          result = {
            type: "error" as const,
            input,
            error,
          };
        }

        let isValid = true;
        for (const guard of guardList) {
          const guardResult = await guard(result);

          if (guardResult === undefined) {
            continue;
          }

          switch (guardResult.action) {
            case "passThrough": {
              break;
            }
            case "retry": {
              input = guardResult.input;
              isValid = false;
              break;
            }
            case "return": {
              result = {
                type: "value" as const,
                input,
                output: guardResult.output,
              };
              break;
            }
            case "throwError": {
              result = {
                type: "error" as const,
                input,
                error: guardResult.error,
              };
              break;
            }
          }
        }

        if (isValid) {
          if (result.type === "value") {
            return result.output;
          } else {
            throw result.error;
          }
        }

        attempts++;
      }

      // TODO dedicated error type
      throw new Error(
        `Maximum attempts of ${maxAttempts} reached ` +
          `without producing a valid output or handling an error.`
      );
    },
  });
}
