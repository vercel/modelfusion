/**
 * Validates that the structure of `value` matches the structure of this schema.
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
   * Only used for type inference.
   */
  readonly _type: STRUCTURE;
}
