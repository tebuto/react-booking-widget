import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    staticDirs: ['../public'],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
    typescript: {
        reactDocgen: 'react-docgen-typescript'
    },
    core: {
        disableTelemetry: true
    }
}

export default config
