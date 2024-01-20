import styled from "@emotion/styled";
import Head from "next/head";
import { useState } from "react";

const Placeholder = styled.div`
  width: 552px;
  height: 552px;

  overflow: hidden;
  padding: 20px;

  background:
    radial-gradient(circle at bottom, #fff 85%, transparent 0%) top / 20px 20px
      repeat-x,
    radial-gradient(circle at top, #fff 85%, transparent 0%) bottom / 20px 20px
      repeat-x,
    radial-gradient(circle at left, #fff 85%, transparent 0%) right / 20px 20px
      repeat-y,
    radial-gradient(circle at right, #fff 85%, transparent 0%) left / 20px 20px
      repeat-y,
    linear-gradient(#fff, #fff) center/calc(100% - 40px) calc(100% - 40px)
      no-repeat;
`;

const StyledImage = styled.img`
  width: 552px;
  height: 552px;

  overflow: hidden;
  padding: 20px;

  background: 
  radial-gradient(circle at bottom, #fff 85%,transparent 0%)top /20px 20px repeat-x,
  radial-gradient(circle at top, #fff 85%,transparent 0%)bottom /20px 20px repeat-x,
  radial-gradient(circle at left, #fff 85%,transparent 0%)right /20px 20px repeat-y,
  radial-gradient(circle at right, #fff 85%,transparent 0%)left /20px 20px repeat-y,
  linear-gradient(#fff,#fff) center/calc(100% - 40px) calc(100% - 40px) no-repeat;
}
`;

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputValue }),
      });

      if (response.ok) {
        const image = await response.json();
        setImageSrc(`data:image/png;base64,${image}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ModelFusion image generator example</title>
      </Head>
      <div className={"table"}>
        <div className={"paper"}>
          <form
            className="flex items-center justify-center"
            onSubmit={handleSubmit}
          >
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 mr-4 text-grey-darker"
              type="text"
              placeholder="Generate image..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              className="flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded"
              type="submit"
              disabled={isLoading}
            >
              Submit
            </button>
          </form>
          <div className="mt-4">
            {isLoading ? (
              <Placeholder />
            ) : (
              imageSrc && <StyledImage src={imageSrc} alt="Generated" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
