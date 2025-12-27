import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
    typescript: {
        reactDocgen: 'react-docgen-typescript'
    },
    staticDirs: ['../public']
}

export default config
