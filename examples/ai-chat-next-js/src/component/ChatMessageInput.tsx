import SendIcon from "@mui/icons-material/Send";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useState } from "react";

export const ChatMessageInput: React.FC<{
  disabled?: boolean;
  onSend: (message: string) => void;
}> = ({ disabled, onSend }) => {
  const [content, setContent] = useState<string>("");

  const handleSend = () => {
    if (content == null || content.length === 0) {
      return;
    }

    onSend(content);
    setContent("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        height: "160px",
        width: "100%",
        backgroundImage:
          "linear-gradient(to bottom, transparent, #1A2439, #1A2439)",
      }}
    >
      <div
        style={{
          maxWidth: "768px",
          position: "relative",
          margin: "0 auto",
          bottom: "-80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginLeft: "16px",
            marginRight: "16px",
            backgroundColor: "rgba(255, 255, 255, .05)",
            boxShadow: "rgba(0, 0, 0, 0) 0px 0px 5px 0px",
            border: "1px solid rgba(17, 24, 39, 0.5)",
            borderRadius: "6px",
          }}
        >
          <TextField
            placeholder={"Send a message."}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <IconButton disabled onClick={handleSend} edge="end">
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onChange={(event) => setContent(event.target.value)}
            value={content}
            sx={{
              width: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};
