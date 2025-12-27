import { render, screen } from '@testing-library/react'
import { TebutoProvider, useTebutoContext } from './TebutoProvider'

function TestConsumer() {
    const context = useTebutoContext()
    return (
        <div>
            <span data-testid="therapistUUID">{context.therapistUUID}</span>
            <span data-testid="apiBaseUrl">{context.apiBaseUrl}</span>
            <span data-testid="categories">{context.categories?.join(',') ?? 'none'}</span>
            <span data-testid="includeSubusers">{String(context.includeSubusers ?? 'undefined')}</span>
            <span data-testid="buildUrl">{context.buildUrl('/test')}</span>
        </div>
    )
}

describe('TebutoProvider', () => {
    const therapistUUID = '9fddab56-5dd5-4bc4-b1bd-3b1d52eb952f'

    it('should provide therapistUUID to consumers', () => {
        render(
            <TebutoProvider therapistUUID={therapistUUID}>
                <TestConsumer />
            </TebutoProvider>
        )

        expect(screen.getByTestId('therapistUUID').textContent).toBe(therapistUUID)
    })

    it('should provide default apiBaseUrl', () => {
        render(
            <TebutoProvider therapistUUID={therapistUUID}>
                <TestConsumer />
            </TebutoProvider>
        )

        expect(screen.getByTestId('apiBaseUrl').textContent).toBe('https://api.tebuto.de')
    })

    it('should allow custom apiBaseUrl', () => {
        const customApiUrl = 'https://custom.api.example.com'
        render(
            <TebutoProvider therapistUUID={therapistUUID} apiBaseUrl={customApiUrl}>
                <TestConsumer />
            </TebutoProvider>
        )

        expect(screen.getByTestId('apiBaseUrl').textContent).toBe(customApiUrl)
    })

    it('should provide categories when specified', () => {
        const categories = [1, 2, 3]
        render(
            <TebutoProvider therapistUUID={therapistUUID} categories={categories}>
                <TestConsumer />
            </TebutoProvider>
        )

        expect(screen.getByTestId('categories').textContent).toBe('1,2,3')
    })

    it('should provide includeSubusers when specified', () => {
        render(
            <TebutoProvider therapistUUID={therapistUUID} includeSubusers={true}>
                <TestConsumer />
            </TebutoProvider>
        )

        expect(screen.getByTestId('includeSubusers').textContent).toBe('true')
    })

    it('should build URLs correctly', () => {
        render(
            <TebutoProvider therapistUUID={therapistUUID}>
                <TestConsumer />
            </TebutoProvider>
        )

        expect(screen.getByTestId('buildUrl').textContent).toBe('https://api.tebuto.de/test')
    })

    it('should build URLs correctly with custom apiBaseUrl', () => {
        const customApiUrl = 'https://custom.api.example.com'
        render(
            <TebutoProvider therapistUUID={therapistUUID} apiBaseUrl={customApiUrl}>
                <TestConsumer />
            </TebutoProvider>
        )

        expect(screen.getByTestId('buildUrl').textContent).toBe('https://custom.api.example.com/test')
    })
})

describe('useTebutoContext', () => {
    it('should throw error when used outside of TebutoProvider', () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => {
            render(<TestConsumer />)
        }).toThrow('useTebutoContext must be used within a TebutoProvider')

        consoleSpy.mockRestore()
    })
})
