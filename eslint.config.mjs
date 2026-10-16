import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    rules: {
      camelcase: `off`,
      '@typescript-eslint/no-explicit-any': `off`,
      '@typescript-eslint/no-require-imports': `off`,
      '@typescript-eslint/no-use-before-define': `warn`,
      // Rules introduced with the React Compiler: existing code predates them
      'react-hooks/set-state-in-effect': `warn`,
      'react-hooks/refs': `warn`,
      'react-hooks/immutability': `warn`,
    },
  },
  {
    ignores: [
      `.next/**`,
      `out/**`,
      `node_modules/**`,
      `public/**`,
      `next-env.d.ts`,
    ],
  },
];

export default eslintConfig;
