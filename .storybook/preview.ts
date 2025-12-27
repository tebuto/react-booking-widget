import type { Preview } from '@storybook/react'

// Initialize MSW
async function initMocks() {
    if (typeof window !== 'undefined') {
        const { worker } = await import('../src/mocks/browser')
        await worker.start({
            onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
            serviceWorker: {
                url: '/mockServiceWorker.js'
            }
        })
    }
}

// Start MSW before stories load
initMocks()

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
    }
}

export default preview
