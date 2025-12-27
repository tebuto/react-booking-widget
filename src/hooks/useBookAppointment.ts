import { useCallback, useState } from 'react'
import type { AppointmentLocation, BookingResponse, ClientInfo, TimeSlot } from '../api-types'
import { useTebutoContext } from './TebutoProvider'

type BookingState = {
    booking: BookingResponse | null
    isLoading: boolean
    error: Error | null
    isSuccess: boolean
}

type BookAppointmentParams = {
    slot: TimeSlot
    client: ClientInfo
    locationSelection?: AppointmentLocation
}

type UseBookAppointmentReturn = BookingState & {
    /** Book the appointment */
    book: (params: BookAppointmentParams) => Promise<BookingResponse | null>
    /** Reset the booking state */
    reset: () => void
    /** Download the calendar file (.ics) */
    downloadCalendar: () => void
}

/**
 * useBookAppointment - Complete the booking process
 *
 * Submits the booking with client information and handles
 * the response including calendar download.
 *
 * @example
 * ```tsx
 * const { book, booking, isLoading, isSuccess, downloadCalendar, reset } = useBookAppointment()
 *
 * const handleSubmit = async (clientInfo: ClientInfo) => {
 *   const result = await book({
 *     slot: claimedSlot,
 *     client: clientInfo,
 *     locationSelection: selectedLocation
 *   })
 *
 *   if (result) {
 *     setStep('confirmation')
 *   }
 * }
 *
 * if (isSuccess) {
 *   return (
 *     <SuccessMessage>
 *       <button onClick={downloadCalendar}>Add to Calendar</button>
 *       <button onClick={reset}>Book Another</button>
 *     </SuccessMessage>
 *   )
 * }
 * ```
 */
export function useBookAppointment(): UseBookAppointmentReturn {
    const { therapistUUID, buildUrl } = useTebutoContext()
    const [state, setState] = useState<BookingState>({
        booking: null,
        isLoading: false,
        error: null,
        isSuccess: false
    })

    const book = useCallback(
        async (params: BookAppointmentParams): Promise<BookingResponse | null> => {
            const { slot, client, locationSelection } = params

            setState(prev => ({ ...prev, isLoading: true, error: null }))

            try {
                const response = await fetch(buildUrl(`/events/${therapistUUID}/book`), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        start: slot.start,
                        end: slot.end,
                        eventRuleId: slot.eventRuleId,
                        locationSelection: locationSelection ?? slot.location,
                        ...client
                    })
                })

                if (!response.ok) {
                    throw new Error(`Booking failed: ${response.statusText}`)
                }

                const booking = (await response.json()) as BookingResponse

                setState({
                    booking,
                    isLoading: false,
                    error: null,
                    isSuccess: true
                })

                return booking
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error occurred')
                setState(prev => ({ ...prev, isLoading: false, error, isSuccess: false }))
                return null
            }
        },
        [therapistUUID, buildUrl]
    )

    const reset = useCallback(() => {
        setState({
            booking: null,
            isLoading: false,
            error: null,
            isSuccess: false
        })
    }, [])

    const downloadCalendar = useCallback(() => {
        if (!state.booking?.ics) return

        const blob = new Blob([state.booking.ics], { type: 'text/calendar;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'appointment.ics')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }, [state.booking])

    return {
        ...state,
        book,
        reset,
        downloadCalendar
    }
}

