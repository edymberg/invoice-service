// eslint.config.js
import tseslint from "typescript-eslint"; // meta-package: presets flat, parser y plugin
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import promise from "eslint-plugin-promise";
import sonarjs from "eslint-plugin-sonarjs";
import security from "eslint-plugin-security";
import n from "eslint-plugin-n";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Ignora carpetas y archivos generados
  {
    ignores: [
      "tests/**",
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "*.config.js",
      "*.config.cjs",
      "jest.config.cjs",
    ],
  },

  // Presets flat recomendados de TypeScript-ESLint (estos sí son iterables)
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      // Parser desde el meta-package (equivale a @typescript-eslint/parser)
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        // ▶ Si más adelante quieres reglas type-aware, descomenta esto y cambia el preset a recommendedTypeChecked más abajo.
        // project: ['./tsconfig.json'],
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    plugins: {
      // Plugin desde el meta-package (equivale a @typescript-eslint/eslint-plugin)
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      unicorn,
      promise,
      sonarjs,
      security,
      n,
      prettier: prettierPlugin,
    },
    settings: {
      // Resolver para imports TS (usa eslint-import-resolver-typescript)
      "import/resolver": {
        typescript: true,
      },
    },
    rules: {
      /** --- Reglas @typescript-eslint relevantes --- */
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrors: "all", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",

      /** --- Core --- */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      semi: ["error", "always"],

      /** --- Import --- */
      "import/order": [
        "error",
        {
          groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",

      /** --- Promise --- */
      "promise/always-return": "off",
      "promise/no-nesting": "warn",
      "promise/no-new-statics": "error",
      "promise/no-return-wrap": "error",
      "promise/no-multiple-resolved": "error",

      /** --- Unicorn (elige las que te gusten) --- */
      "unicorn/prefer-node-protocol": "error",
      "unicorn/no-null": "off", // En TS, `null` puede ser válido por contrato
      "unicorn/filename-case": "off", // Desactivado para permitir sufijos como DTO, VO, etc.

      /** --- SonarJS --- */
      "sonarjs/no-duplicate-string": ["warn", { threshold: 3 }],
      "sonarjs/cognitive-complexity": ["warn", 15],

      /** --- Security --- */
      "security/detect-object-injection": "off", // Ruidosa en muchos casos
      "security/detect-non-literal-fs-filename": "warn",

      /** --- Node --- */
      "n/no-missing-import": "off", // con TS resolver evitamos falsos positivos
      "n/no-unsupported-features/es-syntax": "off",

      /** --- Prettier: fuente de verdad de estilo/indentación --- */
      "prettier/prettier": [
        "error",
        {
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: false,
          trailingComma: "all",
          bracketSpacing: true,
          arrowParens: "always",
          endOfLine: "lf",
        },
      ],
    },
  },

  // Desactiva reglas de estilo que choquen con Prettier
  eslintConfigPrettier,
];