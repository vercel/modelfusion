export interface Cache {
  lookupValue(key: {
    functionType: string;
    functionId?: string | undefined;
    input: unknown;
  }): Promise<object | null>;

  storeValue(
    key: {
      functionType: string;
      functionId?: string | undefined;
      input: unknown;
    },
    value: unknown
  ): Promise<void>;
}
