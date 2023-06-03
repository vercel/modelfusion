// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "ai-utils.js",
  tagline:
    "A TypeScript-first library for building production-grade AI apps, chatbots and agents.",
  // favicon: "img/favicon.ico",
  url: "https://ai-utils.js",
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
  },

  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "api",
          path: "docs",
          sidebarPath: require.resolve("./sidebars.js"),
          lastVersion: "current",
          onlyIncludeVersions: ["current"],
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "concepts",
        id: "concepts",
        path: "concepts",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "providers",
        id: "providers",
        path: "providers",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "recipes",
        id: "recipes",
        path: "recipes",
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        // typedoc options:
        entryPoints: [
          "../src/image/index.ts",
          "../src/internal/index.ts",
          "../src/model-provider/cohere/index.ts",
          "../src/model-provider/huggingface/index.ts",
          "../src/model-provider/openai/index.ts",
          "../src/model-provider/stability/index.ts",
          "../src/run/index.ts",
          "../src/text/index.ts",
          "../src/util/index.ts",
          "../src/vector-db/index.ts",
        ],
        tsconfig: "../tsconfig.json",
        groupOrder: ["Functions", "Variables", "*"],
        excludePrivate: true,
        name: "ai-utils.js",
        plugin: ["typedoc-plugin-zod"],

        // docusaurus options:
        out: ".",
        sidebar: {
          categoryLabel: "API",
          collapsed: false,
          fullNames: true,
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      // image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "ai-utils.js",
        items: [
          {
            to: "/concepts/",
            label: "Concepts",
            activeBaseRegex: `/concepts/`,
            sidebarId: "concepts",
            position: "left",
          },
          {
            to: "/providers/model-providers/",
            label: "Providers",
            activeBaseRegex: `/providers/`,
            sidebarId: "providers",
            position: "left",
          },
          {
            to: "/recipes/",
            label: "Recipes",
            activeBaseRegex: `/recipes/`,
            sidebarId: "recipes",
            position: "left",
          },
          {
            href: "https://github.com/lgrammel/ai-utils.js/tree/main/examples",
            label: "Examples",
          },
          {
            to: "/api/modules/",
            label: "API",
            activeBaseRegex: `/api/`,
            position: "left",
          },
          {
            href: "https://github.com/lgrammel/ai-utils.js",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Documentation",
            items: [
              {
                label: "Concepts",
                to: "/concepts/",
              },
              {
                label: "Providers",
                to: "/providers/model-providers/",
              },
              {
                label: "Recipes",
                to: "/recipes/",
              },
              {
                href: "https://github.com/lgrammel/ai-utils.js/tree/main/examples",
                label: "Examples",
              },
              {
                label: "API",
                to: "/api/modules/",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Twitter",
                href: "https://twitter.com/lgrammel",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/lgrammel/ai-utils.js",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Lars Grammel.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
