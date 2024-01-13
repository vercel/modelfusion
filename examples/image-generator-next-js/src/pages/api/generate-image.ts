import { generateImage, stability } from "modelfusion";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: true },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { text: description } = req.body;

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

  try {
    res.status(200).json(imageBase64);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.toString(), error });
    return;
  }
}
