import {
  StabilityApiConfiguration,
  generateImage,
  stability,
} from "modelfusion";
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

  const { imageBase64 } = await generateImage(
    stability.ImageGenerator({
      // explicit API configuration needed for NextJS environment
      // (otherwise env variables are not available):
      api: new StabilityApiConfiguration({
        apiKey: process.env.STABILITY_API_KEY,
      }),
      model: "stable-diffusion-512-v2-1",
      clipGuidancePreset: "FAST_BLUE",
      cfgScale: 10,
      height: 512,
      width: 512,
      samples: 1,
      steps: 30,
    }),
    [
      { text: description },
      { text: "style of early 19th century painting", weight: 0.5 },
    ],
    { fullResponse: true }
  );

  try {
    res.status(200).json(imageBase64);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.toString(), error });
    return;
  }
}
