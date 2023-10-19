import { AsyncQueue, DefaultRun } from "modelfusion";

export type Asset = {
  data: Buffer;
  contentType: string;
  name: string;
};

export class EndpointRun<EVENT> extends DefaultRun {
  readonly eventQueue: AsyncQueue<EVENT> = new AsyncQueue();
  readonly assets: Record<string, Asset> = {};
  readonly endpointName: string;

  constructor({ endpointName }: { endpointName: string }) {
    super();
    this.endpointName = endpointName;
  }

  publishEvent(event: EVENT) {
    this.eventQueue.push(event);
  }

  async storeBinaryAsset(asset: Asset): Promise<string> {
    this.assets[asset.name] = asset;
    return `/${this.endpointName}/${this.runId}/assets/${asset.name}`;
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
