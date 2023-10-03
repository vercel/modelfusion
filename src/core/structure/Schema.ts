import { TypeCheck } from "./TypeCheck";

/**
 * Schema defines a structure for a JSON object.
 */
export interface Schema<STRUCTURE> extends TypeCheck<STRUCTURE> {
  /**
   * Returns the JSON schema for this schema. The schema has to be a valid JSON schema in object form.
   */
  getJsonSchema(): unknown;
}
