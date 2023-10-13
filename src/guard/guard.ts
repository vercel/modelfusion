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
  | {
      action: "retry";
      input: INPUT;
    }
  | {
      action: "return";
      output: OUTPUT;
    }
  | {
      action: "throwError";
      error: unknown;
    }
  | {
      action: "passThrough";
    }
  | undefined
>;

export async function guard<INPUT, OUTPUT>(
  execute: (input: INPUT) => PromiseLike<OUTPUT>,
  input: INPUT,
  guards: Array<Guard<INPUT, OUTPUT>> | Guard<INPUT, OUTPUT>,
  options?: { maxRetries: number }
): Promise<OUTPUT | undefined> {
  if (typeof guards === "function") {
    guards = [guards];
  }

  const maxRetries = options?.maxRetries ?? 1;

  let attempts = 0;
  while (attempts <= maxRetries) {
    let result: OutputResult<INPUT, OUTPUT>;

    try {
      result = {
        type: "value" as const,
        input,
        output: await execute(input),
      };
    } catch (error) {
      result = {
        type: "error" as const,
        input,
        error,
      };
    }

    let isValid = true;
    for (const guard of guards) {
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

  throw new Error(
    `Maximum retry attempts of ${maxRetries} reached ` +
      `without producing a valid output or handling an error after ${attempts} attempts.`
  );
}
