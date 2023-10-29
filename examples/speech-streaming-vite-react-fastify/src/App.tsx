import { ZodSchema } from "modelfusion";
import { MediaSourceAppender, readEventSource } from "modelfusion/browser";
import { useState } from "react";
import "./App.css";
import { duplexStreamingFlowSchema } from "./eventSchema";
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

    const url: string = (await response.json()).url;

    readEventSource({
      url,
      schema: new ZodSchema(duplexStreamingFlowSchema.events),
      isStopEvent(event) {
        return event.data === "[DONE]";
      },
      onEvent(event) {
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
      },
      onStop() {
        audioSource.close();
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
