import { NextApiRequest, NextApiResponse } from "next";
import { generateStabilityImage } from "ai-utils.js/provider/stability";

export const config = {
  api: { bodyParser: true },
};

const stabilityApiKey = process.env.STABILITY_API_KEY ?? "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { text: query } = req.body;

  const imageResponse = await generateStabilityImage({
    apiKey: stabilityApiKey,
    engineId: "stable-diffusion-512-v2-1",
    textPrompts: [
      { text: query },
      { text: "style of early 19th century painting", weight: 0.5 },
    ],
    cfgScale: 7,
    clipGuidancePreset: "FAST_BLUE",
    height: 512,
    width: 512,
    samples: 1,
    steps: 30,
  });

  try {
    res.status(200).json(imageResponse.artifacts[0].base64);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.toString(), error });
    return;
  }
}
