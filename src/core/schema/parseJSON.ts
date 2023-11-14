import SecureJSON from "secure-json-parse";
import { JSONParseError } from "./JSONParseError.js";
import { Schema } from "./Schema.js";

/**
 * Parses a JSON string into an unknown object.
 *
 * @param text - The JSON string to parse.
 * @returns {unknown} - The parsed JSON object.
 */
export function parseJSON({
  text,
  schema,
}: {
  text: string;
  schema?: undefined;
}): unknown;
/**
 * Parses a JSON string into a strongly-typed object using the provided schema.
 *
 * @template T - The type of the object to parse the JSON into.
 * @param {string} text - The JSON string to parse.
 * @param {Schema<T>} schema - The schema to use for parsing the JSON.
 * @returns {T} - The parsed object.
 */
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

/**
 * Safely parses a JSON string and returns the result as an object of type `unknown`.
 *
 * @param text - The JSON string to parse.
 * @returns {object} Either an object with `success: true` and the parsed data, or an object with `success: false` and the error that occurred.
 */
export function safeParseJSON({
  text,
  schema,
}: {
  text: string;
  schema?: undefined;
}):
  | { success: true; data: unknown }
  | { success: false; error: JSONParseError };
/**
 * Safely parses a JSON string into a strongly-typed object, using a provided schema to validate the structure.
 *
 * @template T - The type of the object to parse the JSON into.
 * @param {string} text - The JSON string to parse.
 * @param {Schema<T>} schema - The schema to use for parsing the JSON.
 * @returns An object with either a `success` flag and the parsed and typed data, or a `success` flag and an error object.
 */
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
