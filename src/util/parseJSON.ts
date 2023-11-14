import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { Schema } from "../core/structure/Schema.js";
import { JSONParseError } from "./JSONParseError.js";

export function parseJsonWithZod<T>(json: string, schema: z.Schema<T>) {
  try {
    return schema.parse(SecureJSON.parse(json) as unknown);
  } catch (error) {
    throw new JSONParseError({
      text: json,
      cause: error,
    });
  }
}

export function safeParseJSON({
  text,
  schema,
}: {
  text: string;
  schema?: undefined;
}):
  | { success: true; data: unknown }
  | { success: false; error: JSONParseError };
export function safeParseJSON<T>({
  text,
  schema,
}: {
  text: string;
  schema: Schema<T>;
}): { success: true; data: T } | { success: false; error: JSONParseError };
export function safeParseJSON<T>({
  text,
  schema,
}: {
  text: string;
  schema?: Schema<T>;
}): { success: true; data: T } | { success: false; error: JSONParseError } {
  try {
    const json = SecureJSON.parse(text);

    if (schema == null) {
      return {
        success: true,
        data: json as T,
      };
    }

    const validationResult = schema.validate(json);

    if (validationResult.success) {
      return validationResult;
    }

    return {
      success: false,
      error: new JSONParseError({ text, cause: validationResult.error }),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof JSONParseError
          ? error
          : new JSONParseError({ text, cause: error }),
    };
  }
}
