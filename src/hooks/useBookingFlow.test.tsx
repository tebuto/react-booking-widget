import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TebutoProvider } from './TebutoProvider'
import { useBookingFlow } from './useBookingFlow'

const therapistUUID = '9fddab56-5dd5-4bc4-b1bd-3b1d52eb952f'

const mockTherapist = {
    name: 'Dr. Maria Müller',
    firstName: 'Maria',
    lastName: 'Müller'
}

function createMockSlots() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    return [
        {
            title: 'Erstgespräch',
            start: tomorrow.toISOString(),
            end: new Date(tomorrow.getTime() + 50 * 60000).toISOString(),
            location: 'onsite' as const,
            color: '#00b4a9',
            price: '80.00',
            taxRate: '19',
            eventRuleId: 1,
            eventCategoryId: 1,
            therapist: { id: 1, uuid: therapistUUID, name: 'Dr. Maria Müller' }
        }
    ]
}

const mockBookingResponse = {
    id: 12345,
    createdAt: '2025-01-10T12:00:00.000Z',
    locationSelection: 'onsite',
    isConfirmed: true,
    isOutage: false,
    ics: 'BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR'
}

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <TebutoProvider therapistUUID={therapistUUID}>{children}</TebutoProvider>
    }
}

describe('useBookingFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should start in loading state', () => {
        ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        expect(result.current.step).toBe('loading')
        expect(result.current.isLoading).toBe(true)
    })

    it('should transition to date-selection after data loads', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            if (url.includes('/events/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockSlots
                })
            }
            return Promise.reject(new Error('Unknown endpoint'))
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        expect(result.current.therapist.data).toEqual(mockTherapist)
        expect(result.current.slots.data).toEqual(mockSlots)
    })

    it('should transition to error state on fetch failure', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: 'Internal Server Error'
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('error')
        })

        expect(result.current.error).not.toBeNull()
    })

    it('should select date and move to time-selection', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        expect(result.current.selectedDate).not.toBeNull()
        expect(result.current.step).toBe('time-selection')
    })

    it('should get slots for selected date', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        expect(result.current.selectedDateSlots.length).toBeGreaterThan(0)
    })

    it('should select slot and move to booking-form', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            if (url.includes('/claim')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ isAvailable: true })
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        await act(async () => {
            const success = await result.current.selectSlot(mockSlots[0])
            expect(success).toBe(true)
        })

        expect(result.current.selectedSlot).toEqual(mockSlots[0])
        expect(result.current.step).toBe('booking-form')
    })

    it('should set location for not-fixed slots', async () => {
        const mockSlots = createMockSlots()
        mockSlots[0].location = 'not-fixed'

        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            if (url.includes('/claim')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ isAvailable: true })
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        await act(async () => {
            await result.current.selectSlot(mockSlots[0])
        })

        // Location should not be auto-set for not-fixed
        expect(result.current.selectedLocation).toBeNull()

        act(() => {
            result.current.setLocation('virtual')
        })

        expect(result.current.selectedLocation).toBe('virtual')
    })

    it('should submit booking and move to confirmation', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            if (url.includes('/claim')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ isAvailable: true })
                })
            }
            if (url.includes('/book')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockBookingResponse
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const onBookingComplete = jest.fn()

        const { result } = renderHook(() => useBookingFlow({ onBookingComplete }), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        await act(async () => {
            await result.current.selectSlot(mockSlots[0])
        })

        await act(async () => {
            const success = await result.current.submitBooking({
                firstName: 'Max',
                lastName: 'Mustermann',
                email: 'max@example.com'
            })
            expect(success).toBe(true)
        })

        expect(result.current.step).toBe('confirmation')
        expect(result.current.booking.booking).toEqual(mockBookingResponse)
        expect(onBookingComplete).toHaveBeenCalledWith(mockBookingResponse)
    })

    it('should return false when slot claim fails', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            if (url.includes('/claim')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ isAvailable: false }) // Slot not available
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        await act(async () => {
            const success = await result.current.selectSlot(mockSlots[0])
            expect(success).toBe(false)
        })

        // Verify the slot was not selected due to unavailability
        expect(result.current.selectedSlot).toBeNull()
    })

    it('should reset flow', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            if (url.includes('/claim')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ isAvailable: true })
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        await act(async () => {
            await result.current.selectSlot(mockSlots[0])
        })

        expect(result.current.step).toBe('booking-form')

        act(() => {
            result.current.reset()
        })

        expect(result.current.step).toBe('loading')
        expect(result.current.selectedDate).toBeNull()
        expect(result.current.selectedSlot).toBeNull()
    })

    it('should go to specific step', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        act(() => {
            result.current.goToStep('time-selection')
        })

        expect(result.current.step).toBe('time-selection')
    })

    it('should deselect slot', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            if (url.includes('/claim') || url.includes('/unclaim')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ isAvailable: true, success: true })
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        await act(async () => {
            await result.current.selectSlot(mockSlots[0])
        })

        expect(result.current.selectedSlot).not.toBeNull()

        await act(async () => {
            await result.current.selectSlot(null)
        })

        expect(result.current.selectedSlot).toBeNull()
    })

    it('should clear date selection', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        act(() => {
            result.current.selectDate(tomorrow)
        })

        expect(result.current.selectedDate).not.toBeNull()

        act(() => {
            result.current.selectDate(null)
        })

        expect(result.current.selectedDate).toBeNull()
    })

    it('should expose individual hook states', async () => {
        const mockSlots = createMockSlots()
        ;(global.fetch as jest.Mock).mockImplementation(url => {
            if (url.includes('/therapists/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockTherapist
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockSlots
            })
        })

        const { result } = renderHook(() => useBookingFlow(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.step).toBe('date-selection')
        })

        // Check that individual hooks are accessible
        expect(result.current.therapist).toBeDefined()
        expect(result.current.slots).toBeDefined()
        expect(result.current.claim).toBeDefined()
        expect(result.current.booking).toBeDefined()

        // Check specific properties
        expect(result.current.therapist.data).toEqual(mockTherapist)
        expect(result.current.slots.availableDates).toBeDefined()
        expect(result.current.claim.claim).toBeInstanceOf(Function)
        expect(result.current.booking.book).toBeInstanceOf(Function)
    })
})
