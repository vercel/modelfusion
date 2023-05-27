import { Box, IconButton } from "@mui/material";
import Head from "next/head";
import MicIcon from "@mui/icons-material/Mic";
import { useRef, useState } from "react";

export default function Home() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleButtonPress = () => {
    if (isRecording) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const handleButtonRelease = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);

        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/mp3",
          });
          const formData = new FormData();
          formData.append("audio", audioBlob, "audio.mp3");

          await fetch("/api/audio", {
            method: "POST",
            body: formData,
          });
        } finally {
          setIsTranscribing(false);
          audioChunksRef.current = [];
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const buttonStatus = isTranscribing
    ? "Transcribing..."
    : isRecording
    ? "Recording..."
    : "Push to record";

  return (
    <>
      <Head>
        <title>@lgrammel/ai-utils voice recording summarizer example</title>
      </Head>
      <Box
        component="main"
        sx={{
          position: "relative",
          flexGrow: 1,
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "40px",
            display: "flex",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.2)",
            color: "lightgray",
            padding: "10px",
          }}
        >
          {buttonStatus}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            position: "absolute",
            bottom: "20px",
            left: 0,
            right: 0,
          }}
        >
          <IconButton
            style={{
              background: "darkorange",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
            }}
            onTouchStart={handleButtonPress}
            onTouchEnd={handleButtonRelease}
            onMouseDown={handleButtonPress}
            onMouseUp={handleButtonRelease}
            onMouseLeave={handleButtonRelease}
            onContextMenu={(e) => e.preventDefault()}
            disabled={isTranscribing}
          >
            <MicIcon sx={{ fontSize: "36px" }} />
          </IconButton>
        </Box>
      </Box>
    </>
  );
}
