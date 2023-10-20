import {
  MediaSourceAppender,
  ZodSchema,
  readEventSourceStream,
} from "modelfusion";
import { useState } from "react";
import "./App.css";
import { eventSchema } from "./eventSchema";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

function App() {
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleClick = async () => {
    const baseUrl = "http://localhost:3001";

    setText("");

    const audioSource = new MediaSourceAppender("audio/mpeg");
    setAudioUrl(audioSource.mediaSourceUrl);

    const response = await fetch(`${baseUrl}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const events = readEventSourceStream({
      stream: response.body!,
      schema: new ZodSchema(eventSchema),
    });

    for await (const event of events) {
      switch (event.type) {
        case "text-chunk": {
          setText((currentText) => currentText + event.delta);
          break;
        }

        case "speech-chunk": {
          audioSource.addBase64Data(event.base64Audio);
          break;
        }
      }
    }

    audioSource.close();
  };

  return (
    <>
      <h1 className="text-4xl mb-4">Voice synthesis duplex streaming demo</h1>
      <Textarea
        className="mb-4"
        placeholder="Enter prompt."
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button onClick={handleClick}>Generate response (text & speech)</Button>
      <pre className="mt-4 whitespace-pre-wrap">{text}</pre>

      {audioUrl != null && (
        <div className="flex justify-center mt-4">
          <audio
            controls
            controlsList="nodownload nofullscreen noremoteplayback"
            autoPlay={true}
            src={audioUrl}
          />
        </div>
      )}
    </>
  );
}

export default App;
