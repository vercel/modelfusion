import { generateImage, stability } from "modelfusion";

export const runtime = "edge";

export async function POST(req: Request) {
  const { text: description } = await req.json();

  try {
    const { imageBase64 } = await generateImage({
      model: stability.ImageGenerator({
        // explicit API configuration needed for NextJS environment
        // (otherwise env variables are not available):
        api: stability.Api({ apiKey: process.env.STABILITY_API_KEY }),
        model: "stable-diffusion-v1-6",
        clipGuidancePreset: "FAST_BLUE",
        cfgScale: 10,
        height: 512,
        width: 512,
        steps: 30,
      }),
      prompt: [
        { text: description },
        { text: "style of early 19th century painting", weight: 0.5 },
      ],
      fullResponse: true,
    });

    return Response.json(imageBase64);
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}
