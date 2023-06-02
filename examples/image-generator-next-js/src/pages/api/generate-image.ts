import { StabilityImageGenerationModel } from "ai-utils.js/provider/stability";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: true },
};

const stabilityApiKey = process.env.STABILITY_API_KEY ?? "";

const imageGenerationModel = new StabilityImageGenerationModel({
  apiKey: stabilityApiKey,
  engineId: "stable-diffusion-512-v2-1",
  settings: {
    clipGuidancePreset: "FAST_BLUE",
    cfgScale: 10,
    height: 512,
    width: 512,
    samples: 1,
    steps: 30,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { text: query } = req.body;

  const imageResponse = await imageGenerationModel.generate([
    { text: query },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]);

  const image = await imageGenerationModel.extractImageBase64(imageResponse);

  try {
    res.status(200).json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.toString(), error });
    return;
  }
}
