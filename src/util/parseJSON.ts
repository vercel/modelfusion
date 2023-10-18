import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { Schema } from "../core/structure/Schema.js";
import { JSONParseError } from "./JSONParseError.js";

export function parseJsonWithZod<T>(json: string, schema: z.Schema<T>) {
  try {
    const parsedJson = SecureJSON.parse(json) as unknown;
    return schema.parse(parsedJson);
  } catch (error) {
    throw new JSONParseError({
      valueText: json,
      cause: error,
    });
  }
}

export function safeParseJsonWithZod<T>(
  json: string,
  schema: z.Schema<T>
): { success: true; data: T } | { success: false; error: JSONParseError } {
  try {
    const parsedJson = SecureJSON.parse(json) as unknown;
    const validationResult = schema.safeParse(parsedJson);

    if (validationResult.success) {
      return validationResult;
    }

    return {
      success: false,
      error: new JSONParseError({
        valueText: json,
        cause: validationResult.error,
      }),
    };
  } catch (error) {
    throw new JSONParseError({
      valueText: json,
      cause: error,
    });
  }
}

export function safeParseJsonWithSchema<T>(
  json: string,
  schema: Schema<T>
): { success: true; data: T } | { success: false; error: JSONParseError } {
  try {
    const parsedJson = SecureJSON.parse(json) as unknown;
    const validationResult = schema.validate(parsedJson);

    if (validationResult.success) {
      return validationResult;
    }

    return {
      success: false,
      error: new JSONParseError({
        valueText: json,
        cause: validationResult.error,
      }),
    };
  } catch (error) {
    throw new JSONParseError({
      valueText: json,
      cause: error,
    });
  }
}
