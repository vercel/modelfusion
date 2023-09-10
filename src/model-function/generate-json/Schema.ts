/**
 * Schema defines a structure for a JSON object.
 */
export interface Schema<STRUCTURE> {
  /**
   * Validates that the structure of `value` matches the structure of this schema,
   * and returns a typed version of value if it does.
   */
  validate(
    value: unknown
  ): { success: true; value: STRUCTURE } | { success: false; error: unknown };

  /**
   * Returns the JSON schema for this schema. The schema has to be a valid JSON schema in object form.
   */
  getJsonSchema(): unknown;

  /**
   * Only used for type inference.
   */
  readonly _type: STRUCTURE;
}
