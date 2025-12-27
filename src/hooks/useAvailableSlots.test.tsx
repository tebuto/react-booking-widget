import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TebutoProvider } from './TebutoProvider'
import { useAvailableSlots } from './useAvailableSlots'

const therapistUUID = '9fddab56-5dd5-4bc4-b1bd-3b1d52eb952f'

function createMockSlots() {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const dayAfter = new Date(now)
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(14, 0, 0, 0)

    return [
        {
            title: 'Erstgespräch',
            start: tomorrow.toISOString(),
            end: new Date(tomorrow.getTime() + 50 * 60000).toISOString(),
            location: 'onsite',
            color: '#00b4a9',
            price: '80.00',
            taxRate: '19',
            eventRuleId: 1,
            eventCategoryId: 1,
            therapist: { id: 1, uuid: therapistUUID, name: 'Dr. Maria Müller' }
        },
        {
            title: 'Einzeltherapie',
            start: new Date(tomorrow.getTime() + 2 * 60 * 60000).toISOString(),
            end: new Date(tomorrow.getTime() + 170 * 60000).toISOString(),
            location: 'not-fixed',
            color: '#3b82f6',
            price: '120.00',
            taxRate: '19',
            eventRuleId: 2,
            eventCategoryId: 2,
            therapist: { id: 1, uuid: therapistUUID, name: 'Dr. Maria Müller' }
        },
        {
            title: 'Online-Beratung',
            start: dayAfter.toISOString(),
            end: new Date(dayAfter.getTime() + 50 * 60000).toISOString(),
            location: 'virtual',
            color: '#8b5cf6',
            price: '90.00',
            taxRate: '19',
            eventRuleId: 3,
            eventCategoryId: 3,
            therapist: { id: 1, uuid: therapistUUID, name: 'Dr. Maria Müller' }
        }
    ]
}

function createWrapper(uuid = therapistUUID, categories?: number[]) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <TebutoProvider therapistUUID={uuid} categories={categories}>
                {children}
            </TebutoProvider>
        )
    }
}

describe('useAvailableSlots', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should start with loading state when autoFetch is true', () => {
        // Mock that resolves immediately to avoid hanging
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        // Initial state should be loading
        expect(result.current.isLoading).toBe(true)
    })

    it('should not fetch when autoFetch is false', () => {
        const { result } = renderHook(() => useAvailableSlots({ autoFetch: false }), {
            wrapper: createWrapper()
        })

        expect(result.current.isLoading).toBe(false)
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should fetch slots on mount', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        expect(result.current.data).toEqual(mockSlots)
        expect(result.current.error).toBeNull()
    })

    it('should group slots by date', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        // Should have 2 unique dates (tomorrow and day after)
        expect(Object.keys(result.current.slotsByDate).length).toBe(2)
    })

    it('should return available dates sorted', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        expect(result.current.availableDates.length).toBe(2)
        expect(result.current.availableDates[0].getTime()).toBeLessThan(result.current.availableDates[1].getTime())
    })

    it('should return enriched slots for a date', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const slotsForTomorrow = result.current.getSlotsForDate(tomorrow)

        expect(slotsForTomorrow.length).toBe(2)
        expect(slotsForTomorrow[0]).toHaveProperty('dateKey')
        expect(slotsForTomorrow[0]).toHaveProperty('timeString')
        expect(slotsForTomorrow[0]).toHaveProperty('durationMinutes')
        expect(slotsForTomorrow[0]).toHaveProperty('formattedPrice')
    })

    it('should extract unique categories', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        expect(result.current.categories.length).toBe(3)
        expect(result.current.categories.map(c => c.id)).toEqual([1, 2, 3])
    })

    it('should return total slots count', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        expect(result.current.totalSlots).toBe(3)
    })

    it('should filter by categories when provided in options', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        renderHook(() => useAvailableSlots({ categories: [1, 2] }), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(global.fetch).toHaveBeenCalled()
            },
            { timeout: 1000 }
        )

        const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0]
        // URL encodes comma as %2C
        expect(fetchUrl).toMatch(/categories=1(%2C|,)2/)
    })

    it('should filter by categories from context', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper(therapistUUID, [3])
        })

        await waitFor(
            () => {
                expect(global.fetch).toHaveBeenCalled()
            },
            { timeout: 1000 }
        )

        const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0]
        expect(fetchUrl).toMatch(/categories=3/)
    })

    it('should handle fetch errors', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: 'Internal Server Error'
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        expect(result.current.data).toBeNull()
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('Failed to fetch slots: Internal Server Error')
    })

    it('should refetch data when refetch is called', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        expect(global.fetch).toHaveBeenCalledTimes(1)

        await act(async () => {
            await result.current.refetch()
        })

        expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should filter out past slots', async () => {
        const now = new Date()
        const pastSlot = {
            title: 'Past Slot',
            start: new Date(now.getTime() - 60 * 60000).toISOString(),
            end: new Date(now.getTime() - 10 * 60000).toISOString(),
            location: 'onsite',
            color: '#00b4a9',
            price: '80.00',
            taxRate: '19',
            eventRuleId: 999,
            eventCategoryId: 1,
            therapist: { id: 1, uuid: therapistUUID, name: 'Dr. Maria Müller' }
        }

        const mockSlots = [...createMockSlots(), pastSlot]
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        })

        const { result } = renderHook(() => useAvailableSlots(), {
            wrapper: createWrapper()
        })

        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false)
            },
            { timeout: 1000 }
        )

        const allGroupedSlots = Object.values(result.current.slotsByDate).flat()
        expect(allGroupedSlots.find(s => s.eventRuleId === 999)).toBeUndefined()
    })
})
