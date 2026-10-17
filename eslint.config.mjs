import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
  ...tseslint.configs.recommended,
  ...astro.configs[`flat/recommended`],
  prettierRecommended,
  {
    rules: {
      camelcase: `off`,
      '@typescript-eslint/no-explicit-any': `off`,
      '@typescript-eslint/no-require-imports': `off`,
      '@typescript-eslint/no-use-before-define': `warn`,
    },
  },
  {
    ignores: [`dist/**`, `.astro/**`, `node_modules/**`, `public/**`],
  },
];

export default eslintConfig;
