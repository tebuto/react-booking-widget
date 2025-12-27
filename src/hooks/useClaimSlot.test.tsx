import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { TimeSlot } from '../api-types'
import { TebutoProvider } from './TebutoProvider'
import { useClaimSlot } from './useClaimSlot'

const therapistUUID = '9fddab56-5dd5-4bc4-b1bd-3b1d52eb952f'

const mockSlot: TimeSlot = {
    title: 'Erstgespräch',
    start: '2025-01-15T10:00:00.000Z',
    end: '2025-01-15T10:50:00.000Z',
    location: 'onsite',
    color: '#00b4a9',
    price: '80.00',
    taxRate: '19',
    eventRuleId: 1,
    eventCategoryId: 1,
    therapist: { id: 1, uuid: therapistUUID, name: 'Dr. Maria Müller' }
}

const mockSlot2: TimeSlot = {
    ...mockSlot,
    start: '2025-01-15T14:00:00.000Z',
    end: '2025-01-15T14:50:00.000Z',
    eventRuleId: 2
}

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <TebutoProvider therapistUUID={therapistUUID}>{children}</TebutoProvider>
    }
}

describe('useClaimSlot', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should start with initial state', () => {
        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        expect(result.current.claimedSlot).toBeNull()
        expect(result.current.claimResponse).toBeNull()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should claim a slot successfully', async () => {
        const claimResponse = {
            isAvailable: true,
            requirePhoneNumber: false,
            requireAddress: false
        }

        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => claimResponse
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        let response: unknown
        await act(async () => {
            response = await result.current.claim(mockSlot)
        })

        expect(response).toEqual(claimResponse)
        expect(result.current.claimedSlot).toEqual(mockSlot)
        expect(result.current.claimResponse).toEqual(claimResponse)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should call API with correct parameters', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ isAvailable: true })
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        await act(async () => {
            await result.current.claim(mockSlot)
        })

        expect(global.fetch).toHaveBeenCalledWith(
            `https://api.tebuto.de/events/${therapistUUID}/claim`,
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: mockSlot.start,
                    end: mockSlot.end,
                    eventRuleId: mockSlot.eventRuleId
                })
            })
        )
    })

    it('should handle slot not available', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ isAvailable: false })
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        let response: unknown
        await act(async () => {
            response = await result.current.claim(mockSlot)
        })

        expect(response).toBeNull()
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('This time slot is no longer available')
    })

    it('should handle API errors', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: 'Internal Server Error'
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        let response: unknown
        await act(async () => {
            response = await result.current.claim(mockSlot)
        })

        expect(response).toBeNull()
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('Failed to claim slot: Internal Server Error')
    })

    it('should unclaim current slot before claiming new one', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ isAvailable: true })
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        // Claim first slot
        await act(async () => {
            await result.current.claim(mockSlot)
        })

        expect(result.current.claimedSlot).toEqual(mockSlot)

        // Reset mock calls
        ;(global.fetch as jest.Mock).mockClear()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ isAvailable: true })
        })

        // Claim second slot - should unclaim first
        await act(async () => {
            await result.current.claim(mockSlot2)
        })

        // Should have called unclaim then claim
        expect(global.fetch).toHaveBeenCalledTimes(2)
        expect(result.current.claimedSlot).toEqual(mockSlot2)
    })

    it('should not refetch when claiming same slot', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ isAvailable: true })
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        // Claim first time
        await act(async () => {
            await result.current.claim(mockSlot)
        })

        expect(global.fetch).toHaveBeenCalledTimes(1)

        // Claim same slot again - should return cached response
        await act(async () => {
            await result.current.claim(mockSlot)
        })

        expect(global.fetch).toHaveBeenCalledTimes(1) // No additional calls
    })

    it('should unclaim slot', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ isAvailable: true })
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        // First claim
        await act(async () => {
            await result.current.claim(mockSlot)
        })

        expect(result.current.claimedSlot).toEqual(mockSlot)

        // Unclaim
        await act(async () => {
            await result.current.unclaim()
        })

        expect(result.current.claimedSlot).toBeNull()
        expect(result.current.claimResponse).toBeNull()
    })

    it('should check if a slot is claimed', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ isAvailable: true })
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        expect(result.current.isClaimed(mockSlot)).toBe(false)

        await act(async () => {
            await result.current.claim(mockSlot)
        })

        expect(result.current.isClaimed(mockSlot)).toBe(true)
        expect(result.current.isClaimed(mockSlot2)).toBe(false)
    })

    it('should clear error', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: 'Error'
        })

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        await act(async () => {
            await result.current.claim(mockSlot)
        })

        expect(result.current.error).not.toBeNull()

        act(() => {
            result.current.clearError()
        })

        expect(result.current.error).toBeNull()
    })

    it('should set loading state during claim', async () => {
        let resolvePromise: (value: unknown) => void = () => {}
        ;(global.fetch as jest.Mock).mockImplementation(
            () =>
                new Promise(resolve => {
                    resolvePromise = resolve
                })
        )

        const { result } = renderHook(() => useClaimSlot(), {
            wrapper: createWrapper()
        })

        let claimPromise: Promise<unknown>
        act(() => {
            claimPromise = result.current.claim(mockSlot)
        })

        expect(result.current.isLoading).toBe(true)

        await act(async () => {
            resolvePromise({
                ok: true,
                json: async () => ({ isAvailable: true })
            })
            await claimPromise
        })

        expect(result.current.isLoading).toBe(false)
    })
})
