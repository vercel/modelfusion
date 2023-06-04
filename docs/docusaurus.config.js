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
        routeBasePath: "concept",
        id: "concept",
        path: "concept",
        sidebarCollapsible: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "integration",
        id: "integration",
        path: "integration",
        sidebarCollapsible: false,
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "prompt",
        id: "prompt",
        path: "prompt",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        routeBasePath: "recipe",
        id: "recipe",
        path: "recipe",
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        // typedoc options:
        entryPoints: [
          "../src/image/index.ts",
          "../src/internal/index.ts",
          "../src/model/cohere/index.ts",
          "../src/model/huggingface/index.ts",
          "../src/model/openai/index.ts",
          "../src/model/stability/index.ts",
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
            to: "/concept/",
            label: "Concepts",
            activeBaseRegex: `/concept/`,
            sidebarId: "concept",
            position: "left",
          },
          {
            to: "/integration/model-provider/",
            label: "Integrations",
            activeBaseRegex: `/integration/model-provider/`,
            sidebarId: "integration",
            position: "left",
          },
          {
            to: "/recipe/",
            label: "Recipes",
            activeBaseRegex: `/recipe/`,
            sidebarId: "recipe",
            position: "left",
          },
          {
            to: "/prompt/",
            label: "Prompts",
            activeBaseRegex: `/prompt/`,
            sidebarId: "prompt",
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
                to: "/concept/",
              },
              {
                label: "Integrations",
                to: "/integration/model-provider/",
              },
              {
                label: "API",
                to: "/api/modules/",
              },
            ],
          },
          {
            title: "Learn",
            items: [
              {
                label: "Recipes",
                to: "/recipe/",
              },
              {
                label: "Prompt Library",
                to: "/prompt/",
              },
              {
                href: "https://github.com/lgrammel/ai-utils.js/tree/main/examples",
                label: "Examples",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Twitter",
                href: "https://twitter.com/lgrammel",
              },
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
