import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import * as espree from 'espree';
import react from 'react/package.json' with { type: 'json' };

const eslintConfig = defineConfig([
  ...nextVitals,
  // ESLint 10: eslint-plugin-react's version detection and the Babel parser
  // from eslint-config-next call APIs ESLint 10 removed.
  { settings: { react: { version: react.version } } },
  { files: ['**/*.{js,jsx,mjs,cjs}'], languageOptions: { parser: espree } },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
  ]),
]);

export default eslintConfig;
