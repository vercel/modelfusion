import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { Asset, AssetStorage } from "./AssetStorage";
import { FlowRun } from "./FlowRun";
import { Logger } from "./Logger";

export class FileSystemAssetStorage implements AssetStorage {
  private readonly path: (run: FlowRun<unknown>) => string;
  private readonly logger: Logger;

  constructor({
    path,
    logger,
  }: {
    path: (run: FlowRun<unknown>) => string;
    logger: Logger;
  }) {
    this.path = path;
    this.logger = logger;
  }

  async storeAsset({
    run,
    asset,
  }: {
    run: FlowRun<unknown>;
    asset: Asset;
  }): Promise<void> {
    try {
      const assetPath = this.path(run);
      await fs.mkdir(assetPath, { recursive: true });
      await fs.writeFile(join(assetPath, asset.name), asset.data);
      await fs.writeFile(
        join(assetPath, `${asset.name}.meta.json`),
        JSON.stringify({
          name: asset.name,
          contentType: asset.contentType,
        })
      );
    } catch (error) {
      this.logger.logError({
        run,
        message: `Failed to store asset ${asset.name}`,
        error,
      });
      throw error;
    }
  }

  async readAsset(options: {
    run: FlowRun<unknown>;
    assetName: string;
  }): Promise<Asset | null> {
    try {
      const assetPath = this.path(options.run);
      const data = await fs.readFile(join(assetPath, options.assetName));
      const meta = await fs.readFile(
        join(assetPath, `${options.assetName}.meta.json`)
      );
      const { name, contentType } = JSON.parse(meta.toString());
      return { data, name, contentType };
    } catch (error) {
      this.logger.logError({
        run: options.run,
        message: `Failed to read asset ${options.assetName}`,
        error,
      });
      throw error;
    }
  }
}
