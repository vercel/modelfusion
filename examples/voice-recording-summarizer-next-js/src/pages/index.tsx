import { Box, IconButton } from "@mui/material";
import Head from "next/head";
import MicIcon from "@mui/icons-material/Mic";

export default function Home() {
  return (
    <>
      <Head>
        <title>@lgrammel/ai-utils chat example</title>
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
          >
            <MicIcon sx={{ fontSize: "36px" }} />
          </IconButton>
        </Box>
      </Box>
    </>
  );
}
