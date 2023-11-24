export type MultiModalInput = Array<Content>;

export type Content = TextContent | ImageContent;

export interface TextContent {
  type: "text";

  /**
   * The text content.
   */
  text: string;
}

export interface ImageContent {
  type: "image";

  /**
   * Base-64 encoded image.
   */
  base64Image: string;

  /**
   * Optional mime type of the image.
   */
  mimeType?: string;
}
