import '@testing-library/jest-dom'

// Suppress React 19 act() warnings for async hooks
// These warnings occur when state updates happen in async callbacks
// and are expected behavior for hooks that fetch data
const originalError = console.error
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        const message = args[0]
        if (typeof message === 'string' && message.includes('not wrapped in act')) {
            return
        }
        originalError.apply(console, args)
    }
})

afterAll(() => {
    console.error = originalError
})
