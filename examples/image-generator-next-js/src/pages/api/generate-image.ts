import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { text } = req.body;

  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  const engineId = "stable-diffusion-512-v2-1";
  const apiHost = process.env.API_HOST ?? "https://api.stability.ai";

  if (!STABILITY_API_KEY) throw new Error("Missing Stability API key.");

  const response = await fetch(
    `${apiHost}/v1/generation/${engineId}/text-to-image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: text,
          },
        ],
        cfg_scale: 7,
        clip_guidance_preset: "FAST_BLUE",
        height: 512,
        width: 512,
        samples: 1,
        steps: 30,
      }),
    }
  );

  if (!response.ok) {
    console.error(`Non-200 response: ${await response.text()}`);
    res.status(500).json({ message: "Error generating image" });
    return;
  }

  const responseJSON = await response.json();

  try {
    res.status(200).json(responseJSON);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.toString(), error: error });
    return;
  }
}
