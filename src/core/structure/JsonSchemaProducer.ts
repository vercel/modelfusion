/**
 * Schema defines a structure for a JSON object.
 */
export interface JsonSchemaProducer {
  /**
   * Returns the JSON schema for this schema. The schema has to be a valid JSON schema in object form.
   */
  getJsonSchema(): unknown;
}
