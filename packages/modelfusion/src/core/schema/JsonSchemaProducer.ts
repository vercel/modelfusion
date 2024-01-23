/**
 * A schema defines the typed structure of a JSON object.
 */
export interface JsonSchemaProducer {
  /**
   * Returns the JSON schema for this schema. The schema has to be a valid JSON schema in object form.
   */
  getJsonSchema(): unknown;
}
