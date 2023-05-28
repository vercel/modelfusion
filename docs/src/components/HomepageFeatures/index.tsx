import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  // Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Create agents quickly",
    description: (
      <>
        JS Agent provides many concepts, pre-defined prompts, and tools to help
        you create agents quickly.
      </>
    ),
  },
  {
    title: "Run agents in a server",
    description: (
      <>
        JS Agent contains a HTTP server that host multiple agents. Agent runs
        can be started, stopped, and observed via HTTP API.
      </>
    ),
  },
  {
    title: "Load data",
    description: <>Loaders for reading PDFs and websites</>,
  },
  {
    title: "Calculate costs",
    description: (
      <>
        The <a href="/api/namespaces/cost">cost package</a> contains functions
        that help you calculate the cost of API calls and agent runs.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      {/* <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div> */}
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
