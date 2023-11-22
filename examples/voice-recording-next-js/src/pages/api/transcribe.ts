import { File, Files, IncomingForm } from "formidable";
import fs from "fs";
import {
  OpenAIApiConfiguration,
  generateTranscription,
  getAudioFileExtension,
  openai,
} from "modelfusion";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
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

  try {
    const form = new IncomingForm();

    const parsedForm = await new Promise<{ files: Files }>((resolve, reject) =>
      form.parse(req, (err, _, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ files });
      })
    );

    const { files } = parsedForm;

    if (!files || !files.audio) {
      res.status(400).json({ message: "No files provided" });
      return;
    }

    const audioFile = files.audio as File;
    const mimeType = audioFile.mimetype;
    const fileData = fs.readFileSync(audioFile.filepath);

    if (!mimeType || !fileData) {
      res.status(400).json({ message: "No file data provided" });
      return;
    }

    const transcription = await generateTranscription(
      openai.Transcription({
        // explicit API configuration needed for NextJS environment
        // (otherwise env variables are not available):
        api: new OpenAIApiConfiguration({
          apiKey: process.env.OPENAI_API_KEY,
        }),
        model: "whisper-1",
      }),
      {
        type: getAudioFileExtension(mimeType),
        data: fileData,
      }
    );

    // Remove temporary file
    fs.unlinkSync(audioFile.filepath);

    res.status(200).json({ transcription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.toString(), error });
    return;
  }
}
