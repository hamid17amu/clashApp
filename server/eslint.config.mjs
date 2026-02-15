import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
    rules: {
        semi: 'off',
        quotes: ['error', 'single', { allowTemplateLiterals: true }],
        // '@typescript-eslint/no-explicit-any': 'off',
    },
});
