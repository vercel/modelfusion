import { StabilityImageGenerationModel, generateImage } from "modelfusion";
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

  const { image } = await generateImage(
    new StabilityImageGenerationModel({
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
    ]
  );

  try {
    res.status(200).json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.toString(), error });
    return;
  }
}
