/**
 * Validates that the structure of `data` matches the structure of this schema.
 */
export interface Schema<STRUCTURE> {
  /**
   * Validates that the structure of `data` matches the structure of this schema,
   * and returns a typed version of data if it does.
   */
  validate(
    data: unknown
  ): { success: true; data: STRUCTURE } | { success: false; error: unknown };

  /**
   * Only used for type inference.
   */
  readonly _type: STRUCTURE;
}
