/**
 * A single instruction version prompt. It contains an instruction, a base64 encoded image
 * and an optional mime type of the image.
 *
 * If no mime type is provided, the mime type default to "image/jpeg".
 *
 * @example
 * ```ts
 * {
 *   instruction: "Describe the image in detail:",
 *   image: fs.readFileSync(path.join("data", "example-image.png"), {
 *     encoding: "base64",
 *   }),
 *   mimeType: "image/png"
 * }
 * ```
 */
export type VisionInstructionPrompt = {
  /**
   * The instruction for the model.
   */
  instruction: string;

  /**
   * Base-64 encoded image.
   */
  image: string;

  /**
   * Optional mime type of the image.
   */
  mimeType?: string;
};
