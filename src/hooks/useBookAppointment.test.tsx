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
    eventRuleId: 1,
    eventCategoryId: 1,
    therapist: { id: 1, uuid: therapistUUID, name: 'Dr. Maria Müller' }
}

const mockClientInfo: ClientInfo = {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max@example.com',
    phone: '+49 123 456789',
    notes: 'Test booking'
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

describe('useBookAppointment', () => {
    let createObjectURLMock: jest.Mock
    let revokeObjectURLMock: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()

        // Mock URL methods
        createObjectURLMock = jest.fn(() => 'blob:test-url')
        revokeObjectURLMock = jest.fn()
        global.URL.createObjectURL = createObjectURLMock
        global.URL.revokeObjectURL = revokeObjectURLMock
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should start with initial state', () => {
        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        expect(result.current.booking).toBeNull()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.isSuccess).toBe(false)
    })

    it('should book an appointment successfully', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockBookingResponse
        })

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        let response: unknown
        await act(async () => {
            response = await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(response).toEqual(mockBookingResponse)
        expect(result.current.booking).toEqual(mockBookingResponse)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isSuccess).toBe(true)
        expect(result.current.error).toBeNull()
    })

    it('should call API with correct parameters', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockBookingResponse
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: mockSlot.start,
                    end: mockSlot.end,
                    eventRuleId: mockSlot.eventRuleId,
                    locationSelection: mockSlot.location,
                    ...mockClientInfo
                })
            })
        )
    })

    it('should use custom location selection when provided', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockBookingResponse
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

        let response: unknown
        await act(async () => {
            response = await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(response).toBeNull()
        expect(result.current.booking).toBeNull()
        expect(result.current.isSuccess).toBe(false)
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('Booking failed: Conflict')
    })

    it('should handle network errors', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        let response: unknown
        await act(async () => {
            response = await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        expect(response).toBeNull()
        expect(result.current.error?.message).toBe('Network error')
    })

    it('should reset state', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockBookingResponse
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

        expect(result.current.booking).toBeNull()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isSuccess).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should download calendar file', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockBookingResponse
        })

        // Render hook FIRST before mocking document methods
        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        await act(async () => {
            await result.current.book({
                slot: mockSlot,
                client: mockClientInfo
            })
        })

        // Now mock document methods for downloadCalendar
        const mockLink = {
            href: '',
            setAttribute: jest.fn(),
            click: jest.fn()
        }
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
        const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
        const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)

        act(() => {
            result.current.downloadCalendar()
        })

        expect(createObjectURLMock).toHaveBeenCalled()
        expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'appointment.ics')
        expect(mockLink.click).toHaveBeenCalled()
        expect(removeChildSpy).toHaveBeenCalled()
        expect(revokeObjectURLMock).toHaveBeenCalled()

        createElementSpy.mockRestore()
        appendChildSpy.mockRestore()
        removeChildSpy.mockRestore()
    })

    it('should not download calendar if no booking', () => {
        const { result } = renderHook(() => useBookAppointment(), {
            wrapper: createWrapper()
        })

        act(() => {
            result.current.downloadCalendar()
        })

        expect(createObjectURLMock).not.toHaveBeenCalled()
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

        let bookPromise: Promise<unknown>
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
                json: async () => mockBookingResponse
            })
            await bookPromise
        })

        expect(result.current.isLoading).toBe(false)
    })

    it('should handle booking without optional fields', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockBookingResponse
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
