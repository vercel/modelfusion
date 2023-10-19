import * as dotenv from "dotenv";
import { setGlobalFunctionLogging } from "modelfusion";
import { answerEndpoint } from "../endpoint/answerEndpoint";
import { runEndpointServer } from "./runEndpointServer";

dotenv.config();

setGlobalFunctionLogging("basic-text");

runEndpointServer({
  port: +(process.env.PORT ?? "3001"),
  endpoint: answerEndpoint,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
