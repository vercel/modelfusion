type Entry<DATA> = {
  vectorKey: number[];
  data: DATA;
};

export class InMemoryVectorDB<DATA> {
  private readonly data: Array<Entry<DATA>> = [];

  store(vectorKey: number[], data: DATA): void {
    this.data.push({ vectorKey, data });
  }
}
