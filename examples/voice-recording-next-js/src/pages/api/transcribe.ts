import { File, Files, IncomingForm } from "formidable";
import fs from "fs";
import { OpenAITranscriptionModel, transcribe } from "modelfusion";
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
    const fileData = fs.readFileSync(audioFile.filepath);

    const transcription = await transcribe(
      new OpenAITranscriptionModel({ model: "whisper-1" }),
      {
        type: "mp3",
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
