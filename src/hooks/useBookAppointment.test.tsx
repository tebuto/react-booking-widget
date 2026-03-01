import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { ClientInfo, TimeSlot } from '../api-types'
import { TebutoProvider } from './TebutoProvider'
import { useBookAppointment } from './useBookAppointment'

const therapistUUID = '9fddab56-5dd5-4bc4-b1bd-3b1d52eb952f'

const mockSlot: TimeSlot = {
    title: 'Erstgespräch',
    start: '2025-01-15T10:00:00.000Z',
    end: '2025-01-15T10:50:00.000Z',
    location: 'onsite',
    color: '#00b4a9',
    price: '80.00',
    taxRate: '19',
    outageFeeEnabled: false,
    outageFeeHours: 0,
    outageFeePrice: 0,
    eventRuleId: 1,
    eventCategoryId: 1,
    paymentEnabled: false,
    paymentDuringBooking: false,
    therapist: { id: 1, uuid: therapistUUID, name: 'Dr. Maria Müller' }
}

const mockClientInfo: ClientInfo = {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max@example.com',
    phone: '+49 123 456789',
    notes: 'Test booking'
}

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <TebutoProvider therapistUUID={therapistUUID}>{children}</TebutoProvider>
    }
}

describe('useBookAppointment', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should start with initial state', () => {
        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.isSuccess).toBe(false)
    })

    it('should submit booking request successfully', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({})
        })

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        let response: boolean
        await act(async () => {
            response = await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(response!).toBe(true)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isSuccess).toBe(true)
        expect(result.current.error).toBeNull()
    })

    it('should call API with correct parameters', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({})
        })

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        await act(async () => {
            await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(global.fetch).toHaveBeenCalledWith(
            `https://api.tebuto.de/events/${therapistUUID}/book`,
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
        )

        const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
        expect(callBody).toMatchObject({
            start: mockSlot.start,
            end: mockSlot.end,
            eventRuleId: mockSlot.eventRuleId,
            locationSelection: mockSlot.location,
            ...mockClientInfo
        })
        expect(callBody.fingerprint).toBeDefined()
    })

    it('should use custom location selection when provided', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({})
        })

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        await act(async () => {
            await result.current.book({
                slot: { ...mockSlot, location: 'not-fixed' },
                client: mockClientInfo,
                locationSelection: 'virtual'
            })
        })

        const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
        expect(callBody.locationSelection).toBe('virtual')
    })

    it('should handle booking errors', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: 'Conflict'
        })

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        let response: boolean
        await act(async () => {
            response = await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(response!).toBe(false)
        expect(result.current.isSuccess).toBe(false)
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('Booking failed: Conflict')
    })

    it('should handle network errors', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        let response: boolean
        await act(async () => {
            response = await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(response!).toBe(false)
        expect(result.current.error?.message).toBe('Network error')
    })

    it('should reset state', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({})
        })

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        await act(async () => {
            await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(result.current.isSuccess).toBe(true)

        act(() => {
            result.current.reset()
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isSuccess).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should set loading state during booking', async () => {
        let resolvePromise: (value: unknown) => void = () => {}
        ;(global.fetch as jest.Mock).mockImplementation(
            () =>
                new Promise(resolve => {
                    resolvePromise = resolve
                })
        )

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        let bookPromise: Promise<boolean>
        act(() => {
            bookPromise = result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(result.current.isLoading).toBe(true)

        await act(async () => {
            resolvePromise({
                ok: true,
                json: async () => ({})
            })
            await bookPromise
        })

        expect(result.current.isLoading).toBe(false)
    })

    it('should handle booking without optional fields', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({})
        })

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        const minimalClient: ClientInfo = {
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'max@example.com'
        }

        await act(async () => {
            await result.current.book({
                slot: mockSlot,
                client: minimalClient
            })
        })

        const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
        expect(callBody.firstName).toBe('Max')
        expect(callBody.phone).toBeUndefined()
        expect(callBody.notes).toBeUndefined()
    })
})
