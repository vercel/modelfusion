import { Box } from "@mui/material";

export const ChatMessage: React.FC<{
  message: {
    role: "assistant" | "user";
    content: string;
  };
}> = ({ message }) => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor:
          message.role === "assistant" ? "rgba(66,72,87, 0.5)" : undefined,
      }}
    >
      <Box
        sx={{
          maxWidth: "768px",
          margin: "0 auto",
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        {message.content}
      </Box>
    </Box>
  );
};
