import { FlowRun } from "./FlowRun";

export type Asset = {
  data: Buffer;
  contentType: string;
  name: string;
};

export interface AssetStorage {
  storeAsset(options: { run: FlowRun<unknown>; asset: Asset }): Promise<void>;

  readAsset(options: {
    run: FlowRun<unknown>;
    assetName: string;
  }): Promise<Asset | null>;
}
