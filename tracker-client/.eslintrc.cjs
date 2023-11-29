module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true,
    commonjs: true,
  },
  parser: "@typescript-eslint/parser", // Specifies the ESLint parse
  extends: [
    "plugin:jsx-a11y/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended", // uses typescript-specific linting rules
    "plugin:react/recommended", // uses react-specific linting rules
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 2019, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  rules: {
    //   "@typescript-eslint/explicit-function-return-type": "off",
    //   "@typescript-eslint/no-explicit-any": "off",
    //   "@typescript-eslint/no-unused-vars": "off",
    //   "@typescript-eslint/no-non-null-assertion": "off",
    //   "react-hooks/rules-of-hooks": "error",
    //   "react-hooks/exhaustive-deps": "warn",
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    //   "@typescript-eslint/interface-name-prefix": "warn",
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
  plugins: ["jsx-a11y", "react-hooks", "react", "@typescript-eslint"],
  settings: {
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
};
