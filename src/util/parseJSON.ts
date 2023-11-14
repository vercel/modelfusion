import SecureJSON from "secure-json-parse";
import { Schema } from "../core/structure/Schema.js";
import { JSONParseError } from "./JSONParseError.js";

export function parseJSON({
  text,
  schema,
}: {
  text: string;
  schema?: undefined;
}): unknown;
export function parseJSON<T>({
  text,
  schema,
}: {
  text: string;
  schema: Schema<T>;
}): T;
export function parseJSON<T>({
  text,
  schema,
}: {
  text: string;
  schema?: Schema<T>;
}): T {
  try {
    const json = SecureJSON.parse(text);

    if (schema == null) {
      return json;
    }

    const validationResult = schema.validate(json);

    if (!validationResult.success) {
      throw new JSONParseError({ text, cause: validationResult.error });
    }

    return validationResult.data;
  } catch (error) {
    if (error instanceof JSONParseError) {
      throw error;
    }

    throw new JSONParseError({ text, cause: error });
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
