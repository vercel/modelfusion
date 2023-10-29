import { MediaSourceAppender, ZodSchema, readEventSource } from "modelfusion";
import { useState } from "react";
import "./App.css";
import { eventSchema } from "./eventSchema";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const BASE_URL = "http://localhost:3001";

function App() {
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleClick = async () => {
    setText("");

    const audioSource = new MediaSourceAppender("audio/mpeg");
    setAudioUrl(audioSource.mediaSourceUrl);

    const response = await fetch(`${BASE_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const path: string = (await response.json()).path;

    readEventSource({
      url: `${BASE_URL}${path}`,
      schema: new ZodSchema(eventSchema),
      onEvent(event, eventSource) {
        switch (event.type) {
          case "text-chunk": {
            setText((currentText) => currentText + event.delta);
            break;
          }
          case "speech-chunk": {
            audioSource.addBase64Data(event.base64Audio);
            break;
          }
          case "finished": {
            eventSource.close();
            audioSource.close();
            break;
          }
        }
      },
    });
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
