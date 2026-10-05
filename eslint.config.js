import js from '@eslint/js';
import tseslint from 'typescript-eslint';
const browser={document:'readonly',window:'readonly',matchMedia:'readonly',innerHeight:'readonly',innerWidth:'readonly',scrollY:'readonly',IntersectionObserver:'readonly',ResizeObserver:'readonly',requestAnimationFrame:'readonly',getComputedStyle:'readonly',Node:'readonly'};
export default tseslint.config({ignores:['dist/**','qa-evidence/**']},js.configs.recommended,...tseslint.configs.recommended,{files:['public/*.js'],languageOptions:{globals:browser}},{files:['scripts/**/*.mjs'],languageOptions:{globals:{...browser,console:'readonly',process:'readonly',URL:'readonly'}}});
