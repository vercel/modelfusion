type State =
  | "BEFORE_VALUE"
  | "INSIDE_STRING"
  | "INSIDE_STRING_ESCAPE"
  | "INSIDE_LITERAL"
  | "INSIDE_NUMBER"
  | "INSIDE_OBJECT"
  | "INSIDE_OBJECT_KEY"
  | "AFTER_OBJECT_KEY"
  | "INSIDE_ARRAY";

// Implemented as a scanner that requires a single linear time pass over the partial JSON (and constant memory):
export function fixJson(input: string): string {
  const stack: State[] = ["BEFORE_VALUE"];
  let lastValidIndex = -1;
  let literalStart: number | null = null;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const currentState = stack[stack.length - 1];

    switch (currentState) {
      case "BEFORE_VALUE": {
        switch (char) {
          case '"': {
            lastValidIndex = i;
            stack.pop();
            stack.push("INSIDE_STRING");
            break;
          }

          case "f":
          case "t":
          case "n": {
            lastValidIndex = i;
            literalStart = i;
            stack.pop();
            stack.push("INSIDE_LITERAL");
            break;
          }

          case "-": {
            stack.pop();
            stack.push("INSIDE_NUMBER");
            break;
          }
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9": {
            lastValidIndex = i;
            stack.pop();
            stack.push("INSIDE_NUMBER");
            break;
          }

          case "{": {
            lastValidIndex = i;
            stack.pop();
            stack.push("INSIDE_OBJECT");
            break;
          }

          case "[": {
            lastValidIndex = i;
            stack.pop();
            stack.push("INSIDE_ARRAY");
            stack.push("BEFORE_VALUE");
            break;
          }
        }

        break;
      }

      case "INSIDE_OBJECT": {
        switch (char) {
          case '"': {
            stack.push("INSIDE_OBJECT_KEY");
            break;
          }
        }
        break;
      }

      case "INSIDE_OBJECT_KEY": {
        switch (char) {
          case '"': {
            stack.pop();
            stack.push("AFTER_OBJECT_KEY");
            break;
          }
        }
        break;
      }

      case "AFTER_OBJECT_KEY": {
        switch (char) {
          case ":": {
            stack.pop();
            stack.push("BEFORE_VALUE");
            break;
          }
        }
        break;
      }

      case "INSIDE_STRING": {
        switch (char) {
          case '"': {
            stack.pop();
            lastValidIndex = i;
            break;
          }

          case "\\": {
            stack.push("INSIDE_STRING_ESCAPE");
            break;
          }

          default: {
            lastValidIndex = i;
          }
        }

        break;
      }

      case "INSIDE_ARRAY": {
        switch (char) {
          case ",": {
            stack.push("BEFORE_VALUE");
            break;
          }

          default: {
            lastValidIndex = i;
            break;
          }
        }

        break;
      }

      case "INSIDE_STRING_ESCAPE": {
        stack.pop();
        lastValidIndex = i;

        break;
      }

      case "INSIDE_NUMBER": {
        switch (char) {
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9": {
            lastValidIndex = i;
            break;
          }

          case "e":
          case "E":
          case "-":
          case ".": {
            break;
          }

          case ",": {
            stack.pop();

            if (stack[stack.length - 1] === "INSIDE_ARRAY") {
              stack.push("BEFORE_VALUE");
            }

            break;
          }

          default: {
            stack.pop();
            break;
          }
        }

        break;
      }

      case "INSIDE_LITERAL": {
        const partialLiteral = input.substring(literalStart!, i);

        if (
          !"false".startsWith(partialLiteral) &&
          !"true".startsWith(partialLiteral) &&
          !"null".startsWith(partialLiteral)
        ) {
          stack.pop();

          if (stack[stack.length - 1] === "INSIDE_ARRAY") {
            stack.push("BEFORE_VALUE");
          }
        } else {
          lastValidIndex = i;
        }

        break;
      }
    }
  }

  let result = input.slice(0, lastValidIndex + 1);

  for (let i = stack.length - 1; i >= 0; i--) {
    const state = stack[i];

    switch (state) {
      case "INSIDE_STRING": {
        result += '"';
        break;
      }

      case "INSIDE_OBJECT": {
        result += "}";
        break;
      }

      case "INSIDE_ARRAY": {
        result += "]";
        break;
      }

      case "INSIDE_LITERAL": {
        const partialLiteral = input.substring(literalStart!, input.length);

        if ("true".startsWith(partialLiteral)) {
          result += "true".slice(partialLiteral.length);
        } else if ("false".startsWith(partialLiteral)) {
          result += "false".slice(partialLiteral.length);
        } else if ("null".startsWith(partialLiteral)) {
          result += "null".slice(partialLiteral.length);
        }
      }
    }
  }

  return result;
}
