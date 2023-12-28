import { AsyncQueue, DefaultRun, FunctionEvent } from "modelfusion";
import { Asset, AssetStorage } from "./AssetStorage.js";
import { Logger } from "./Logger.js";
import { PathProvider } from "./PathProvider.js";

export class FlowRun<EVENT> extends DefaultRun {
  readonly eventQueue: AsyncQueue<EVENT> = new AsyncQueue();

  private readonly assetStorage: AssetStorage;
  private readonly logger: Logger;
  private readonly paths: PathProvider;

  constructor({
    paths,
    assetStorage,
    logger,
  }: {
    paths: PathProvider;
    assetStorage: AssetStorage;
    logger: Logger;
  }) {
    super();

    this.paths = paths;
    this.assetStorage = assetStorage;
    this.logger = logger;
  }

  readonly functionObserver = {
    onFunctionEvent: async (event: FunctionEvent) => {
      this.logger.logFunctionEvent({
        run: this,
        event,
      });
    },
  };

  publishEvent(event: EVENT) {
    this.eventQueue.push(event);
  }

  async storeBinaryAsset(asset: Asset): Promise<string> {
    await this.assetStorage.storeAsset({
      run: this,
      asset,
    });

    return this.paths.getAssetUrl(this.runId, asset.name);
  }

  async storeTextAsset(asset: {
    text: string;
    contentType: string;
    name: string;
  }) {
    return this.storeBinaryAsset({
      data: Buffer.from(asset.text),
      contentType: asset.contentType,
      name: asset.name,
    });
  }

  finish() {
    this.eventQueue.close();
  }
}
