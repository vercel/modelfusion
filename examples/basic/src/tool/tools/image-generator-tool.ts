import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
  Tool,
  generateImage,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

export class ImageGeneratorTool<NAME extends string> extends Tool<
  NAME,
  {
    description: string;
    numberOfImages: number;
  },
  string[]
> {
  readonly model: ImageGenerationModel<string, ImageGenerationModelSettings>;

  constructor({
    name = "image-generator" as any,
    description = "Creates images based on a description.",
    descriptionPropertyText = "a description of what the image should show",
    numberOfImagesPropertyText = "how many image variants should be created? max 4",
    model,
  }: {
    name?: NAME;
    description?: string;
    descriptionPropertyText?: string;
    numberOfImagesPropertyText?: string;
    model: ImageGenerationModel<string, ImageGenerationModelSettings>;
  }) {
    super({
      name,
      description,
      parameters: zodSchema(
        z.object({
          description: z.string().describe(descriptionPropertyText),
          numberOfImages: z.number().describe(numberOfImagesPropertyText),
        })
      ),
      execute: async ({ numberOfImages, description }, options) => {
        const { imagesBase64 } = await generateImage({
          model: this.model.withSettings({
            numberOfGenerations: numberOfImages ?? 1,
          }),
          prompt: description,
          fullResponse: true,
          ...options,
        });

        return imagesBase64;
      },
    });

    this.model = model;
  }
}
