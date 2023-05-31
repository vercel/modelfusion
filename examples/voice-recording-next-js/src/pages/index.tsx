import { Box, IconButton, Typography } from "@mui/material";
import Head from "next/head";
import MicIcon from "@mui/icons-material/Mic";
import { useRef, useState } from "react";

export default function Home() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);

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
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && isRecording) {
      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);

        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/mp3",
          });
          const formData = new FormData();
          formData.append("audio", audioBlob, "audio.mp3");

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          const jsonResponse = await response.json();

          setTranscriptions((previousTranscriptions) => [
            ...previousTranscriptions,
            jsonResponse.transcription,
          ]);
        } finally {
          setIsTranscribing(false);
          audioChunksRef.current = [];
        }
      };

      mediaRecorder.stop();
      mediaRecorder.stream?.getTracks().forEach((track) => track.stop()); // stop microphone access

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
        <title>ai-utils.js voice recording summarizer example</title>
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
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 1,
            color: "lightgray",
            padding: "10px",
          }}
        >
          {buttonStatus}
        </Box>
        <Box
          sx={{
            position: "relative",
            height: "100%",
            maxHeight: "100%",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              pt: 7,
              pl: 2,
              pr: 2,
              pb: 2,
            }}
          >
            {transcriptions.map((transcription, index) => (
              <Typography key={index} variant="body1">
                {transcription}
              </Typography>
            ))}
            <Box sx={{ height: "96px" }} />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            position: "absolute",
            bottom: "0",
            left: 0,
            right: 0,
            background: "rgba(0, 0, 0, 0.85)",
          }}
        >
          <Box sx={{ padding: 2 }}>
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
      </Box>
    </>
  );
}
