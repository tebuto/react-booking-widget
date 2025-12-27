import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TebutoProvider } from './TebutoProvider'
import { useTherapist } from './useTherapist'

const mockTherapist = {
    name: 'Dr. Maria Müller',
    firstName: 'Maria',
    lastName: 'Müller',
    address: {
        streetAndNumber: 'Hauptstraße 42',
        additionalInformation: '2. OG',
        city: {
            name: 'München',
            zip: '80331'
        }
    },
    showWatermark: false
}

const therapistUUID = '9fddab56-5dd5-4bc4-b1bd-3b1d52eb952f'

function createWrapper(uuid = therapistUUID) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <TebutoProvider therapistUUID={uuid}>{children}</TebutoProvider>
    }
}

describe('useTherapist', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should start with loading state', () => {
        ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves

        const { result } = renderHook(() => useTherapist(), {
            wrapper: createWrapper()
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeNull()
        expect(result.current.error).toBeNull()
    })

    it('should fetch therapist data on mount', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockTherapist
        })

        const { result } = renderHook(() => useTherapist(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(mockTherapist)
        expect(result.current.error).toBeNull()
        expect(global.fetch).toHaveBeenCalledWith(`https://api.tebuto.de/therapists/uuid/${therapistUUID}`)
    })

    it('should handle fetch errors', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: 'Not Found'
        })

        const { result } = renderHook(() => useTherapist(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toBeNull()
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('Failed to fetch therapist: Not Found')
    })

    it('should handle network errors', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useTherapist(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toBeNull()
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('Network error')
    })

    it('should refetch data when refetch is called', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockTherapist
        })

        const { result } = renderHook(() => useTherapist(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(global.fetch).toHaveBeenCalledTimes(1)

        // Refetch
        await result.current.refetch()

        expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should use correct URL with therapist UUID', async () => {
        const customUUID = 'custom-uuid-12345'
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockTherapist
        })

        renderHook(() => useTherapist(), {
            wrapper: createWrapper(customUUID)
        })

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(`https://api.tebuto.de/therapists/uuid/${customUUID}`)
        })
    })
})
