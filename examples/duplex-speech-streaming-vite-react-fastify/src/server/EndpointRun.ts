import { AsyncQueue, DefaultRun } from "modelfusion";

export class EndpointRun<EVENT> extends DefaultRun {
  readonly eventQueue: AsyncQueue<EVENT> = new AsyncQueue();
  readonly endpointName: string;

  constructor({ endpointName }: { endpointName: string }) {
    super();
    this.endpointName = endpointName;
  }

  publishEvent(event: EVENT) {
    this.eventQueue.push(event);
  }

  finish() {
    this.eventQueue.close();
  }
}
