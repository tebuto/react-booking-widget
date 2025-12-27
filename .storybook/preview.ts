import type { Preview } from '@storybook/react'

let mswInitialized = false

// Initialize MSW
async function initMocks() {
    if (typeof window !== 'undefined' && !mswInitialized) {
        const { worker } = await import('../src/mocks/browser')
        await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
                url: '/mockServiceWorker.js'
            }
        })
        mswInitialized = true
    }
}

const preview: Preview = {
    parameters: {
        layout: 'padded',
        backgrounds: {
            default: 'light gray',
            values: [
                { name: 'light gray', value: '#f3f4f6' },
                { name: 'white', value: '#ffffff' },
                { name: 'dark', value: '#1f2937' }
            ]
        }
    },
    loaders: [
        async () => {
            await initMocks()
            return {}
        }
    ]
}

export default preview
