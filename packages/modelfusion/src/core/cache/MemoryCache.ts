import { Cache } from "./Cache.js";

export class MemoryCache implements Cache {
  private readonly cache = new Map<string, unknown>();

  private hashKey(key: {
    functionType: string;
    functionId?: string | undefined;
    input: unknown;
  }) {
    return JSON.stringify(key);
  }

  async lookupValue(key: {
    functionType: string;
    functionId?: string | undefined;
    input: unknown;
  }): Promise<object | null> {
    return this.cache.get(this.hashKey(key)) ?? null;
  }

  async storeValue(
    key: {
      functionType: string;
      functionId?: string | undefined;
      input: unknown;
    },
    value: unknown
  ): Promise<void> {
    this.cache.set(this.hashKey(key), value);
  }
}
