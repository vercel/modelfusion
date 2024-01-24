/**
 * Validates that the structure of a value matches this schema.
 */
export interface Schema<OBJECT> {
  /**
   * Validates that the structure of a value matches this schema,
   * and returns a typed version of the value if it does.
   */
  validate(
    value: unknown
  ): { success: true; value: OBJECT } | { success: false; error: unknown };

  /**
   * Only used for type inference.
   */
  readonly _type: OBJECT;
}
