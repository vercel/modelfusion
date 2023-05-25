export type SplitFunction = ({}: {
  text: string;
}) => PromiseLike<Array<string>>;
