// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "ai-utils.js",
  tagline:
    "A TypeScript-first library for building AI apps, chatbots and agents.",
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
        routeBasePath: "guide",
        id: "guide",
        path: "guide",
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
        routeBasePath: "tutorial",
        id: "tutorial",
        path: "tutorial",
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        // typedoc options:
        entryPoints: ["../src/index.ts"],
        tsconfig: "../tsconfig.json",
        groupOrder: ["Functions", "Variables", "*"],
        name: "ai-utils.js",
        plugin: ["typedoc-plugin-zod"],
        excludePrivate: true,
        excludeProtected: true,
        sourceLinkTemplate:
          "https://github.com/lgrammel/ai-utils.js/tree/main/{path}#L{line}",

        // docusaurus options:
        out: ".",
        sidebar: {
          categoryLabel: "API Reference",
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
            to: "/guide/",
            label: "Guide",
            activeBaseRegex: `/guide/`,
            sidebarId: "guide",
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
            to: "/tutorial/",
            label: "Examples & Tutorials",
            activeBaseRegex: `/tutorial/`,
            sidebarId: "tutorial",
            position: "left",
          },
          {
            href: "https://github.com/lgrammel/ai-utils.js/tree/main/examples",
            label: "Examples",
          },
          {
            to: "/api/modules/",
            label: "API Reference",
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
                label: "Guide",
                to: "/guide/",
              },
              {
                label: "Integrations",
                to: "/integration/model-provider/",
              },
              {
                label: "API Reference",
                to: "/api/modules/",
              },
            ],
          },
          {
            title: "Learn",
            items: [
              {
                label: "Recipes & Prompts",
                to: "/tutorial/",
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
