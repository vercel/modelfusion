import SecureJSON from "secure-json-parse";
import { JSONParseError } from "./JSONParseError.js";
import { Schema } from "./Schema.js";
import { safeValidateTypes, validateTypes } from "./validateTypes.js";
import { TypeValidationError } from "./TypeValidationError.js";

/**
 * Parses a JSON string into an unknown object.
 *
 * @param text - The JSON string to parse.
 * @returns {unknown} - The parsed JSON object.
 */
export function parseJSON({ text }: { text: string }): unknown;
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

    return validateTypes({ structure: json, schema });
  } catch (error) {
    if (
      error instanceof JSONParseError ||
      error instanceof TypeValidationError
    ) {
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
}: {
  text: string;
}):
  | { success: true; data: unknown }
  | { success: false; error: JSONParseError | TypeValidationError };
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
}):
  | { success: true; data: T }
  | { success: false; error: JSONParseError | TypeValidationError };
export function safeParseJSON<T>({
  text,
  schema,
}: {
  text: string;
  schema?: Schema<T>;
}):
  | { success: true; data: T }
  | { success: false; error: JSONParseError | TypeValidationError } {
  try {
    const json = SecureJSON.parse(text);

    if (schema == null) {
      return {
        success: true,
        data: json as T,
      };
    }

    return safeValidateTypes({ structure: json, schema });
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
