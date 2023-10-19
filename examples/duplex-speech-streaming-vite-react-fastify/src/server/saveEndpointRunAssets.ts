import { promises as fs } from "fs";
import { join } from "path";
import { EndpointRun } from "./EndpointRun";

export async function saveEndpointRunAssets({
  basePath,
  run,
}: {
  basePath: string;
  run: EndpointRun<any>;
}) {
  const runDir = join(basePath, run.endpointName, run.runId);

  // Ensure the directory structure exists
  await fs.mkdir(runDir, { recursive: true });

  // Write each asset to the disk
  for (const assetName in run.assets) {
    const asset = run.assets[assetName];
    const assetPath = join(runDir, assetName);
    await fs.writeFile(assetPath, asset.data);
  }
}
