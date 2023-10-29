module.exports = {
  "src/**/*.ts": ["eslint --fix", "prettier --write"],
  "src/**/*.{json,md}": "prettier --write",
  "extensions/**/*.ts": ["eslint --fix", "prettier --write"],
  "examples/**/*.ts": ["prettier --write"],
  "test-environments/**/*.{ts,js}": ["prettier --write"],
};
