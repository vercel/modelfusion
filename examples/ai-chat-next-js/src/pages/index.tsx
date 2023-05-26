import { ChatMessageInput } from "@/component/ChatMessageInput";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>@lgrammel/ai-utils chat example</title>
      </Head>
      <ChatMessageInput
        disabled={true}
        onSend={(message) => {
          console.log(`onSend: ${message}`);
        }}
      />
    </>
  );
}
