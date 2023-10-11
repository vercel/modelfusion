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

export type Guard<INPUT, OUTPUT> = {
  isValid: OutputValidator<INPUT, OUTPUT>;
} & (
  | {
      whenInvalid: "retry";
      modifyInputForRetry: (
        result: OutputResult<INPUT, OUTPUT>
      ) => PromiseLike<INPUT>;
    }
  | {
      whenInvalid: "modifyOutput";
      modifyOutput: (
        result: OutputResult<INPUT, OUTPUT>
      ) => PromiseLike<OUTPUT>;
    }
  | {
      whenInvalid: "throwError";
      createError: (
        result: OutputResult<INPUT, OUTPUT>
      ) => PromiseLike<unknown>;
    }
);

export async function guard<INPUT, OUTPUT>(
  execute: (input: INPUT) => PromiseLike<OUTPUT>,
  input: INPUT,
  guards: Array<Guard<INPUT, OUTPUT>>,
  options?: { maxRetries: number }
): Promise<OUTPUT | undefined> {
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
      const validationResult = await guard.isValid(result);

      if (!validationResult) {
        switch (guard.whenInvalid) {
          case "retry": {
            input = await guard.modifyInputForRetry(result);
            isValid = false;
            break;
          }
          case "modifyOutput": {
            result = {
              type: "value" as const,
              input,
              output: await guard.modifyOutput(result),
            };
            break;
          }
          case "throwError": {
            result = {
              type: "error" as const,
              input,
              error: await guard.createError(result),
            };
          }
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
