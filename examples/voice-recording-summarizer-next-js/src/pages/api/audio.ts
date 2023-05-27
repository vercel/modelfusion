import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(500).json({ message: "Something went wrong", error: err });
        return;
      }

      // We assume 'audio' contains a single file
      const audioFile = files.audio as File;
      const fileData = fs.readFileSync(audioFile.filepath);

      // Now you can save `fileData` to a database, a file system, a cloud storage, etc.

      res.status(200).json({ message: "Audio received" });
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
