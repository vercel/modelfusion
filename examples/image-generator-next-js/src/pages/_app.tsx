import "@/styles/normalize.css";
import "@/styles/globals.css";
import "@/styles/app.css";
import type { AppProps } from "next/app";

export default function ExampleApp({
  Component,
  pageProps,
}: AppProps): JSX.Element {
  return <Component {...pageProps} />;
}
