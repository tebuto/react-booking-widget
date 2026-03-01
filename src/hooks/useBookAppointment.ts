import { useCallback, useState } from 'react'
import type { AppointmentLocation, ClientInfo, TimeSlot } from '../api-types'
import { useTebutoContext } from './TebutoProvider'

type BookingRequestState = {
    isLoading: boolean
    error: Error | null
    isSuccess: boolean
}

type BookAppointmentParams = {
    slot: TimeSlot
    client: ClientInfo
    locationSelection?: AppointmentLocation
}

type UseBookAppointmentReturn = BookingRequestState & {
    /** Submit booking request - returns true on success */
    book: (params: BookAppointmentParams) => Promise<boolean>
    /** Reset the state */
    reset: () => void
}

/**
 * useBookAppointment - Submit a public booking request
 *
 * Submits a booking request with client information. For public bookings,
 * the client will receive a confirmation email to verify the appointment.
 *
 * @example
 * ```tsx
 * const { book, isLoading, isSuccess, error, reset } = useBookAppointment()
 *
 * const handleSubmit = async (clientInfo: ClientInfo) => {
 *   const success = await book({
 *     slot: claimedSlot,
 *     client: clientInfo,
 *     locationSelection: selectedLocation
 *   })
 *
 *   if (success) {
 *     setStep('confirmation')
 *   }
 * }
 * ```
 */
export function useBookAppointment(): UseBookAppointmentReturn {
    const { therapistUUID, buildUrl, fingerprint } = useTebutoContext()
    const [state, setState] = useState<BookingRequestState>({
        isLoading: false,
        error: null,
        isSuccess: false
    })

    const book = useCallback(
        async (params: BookAppointmentParams): Promise<boolean> => {
            const { slot, client, locationSelection } = params

            setState({ isLoading: true, error: null, isSuccess: false })

            try {
                const response = await fetch(buildUrl(`/events/${therapistUUID}/book`), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fingerprint,
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

                setState({
                    isLoading: false,
                    error: null,
                    isSuccess: true
                })

                return true
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error occurred')
                setState({ isLoading: false, error, isSuccess: false })
                return false
            }
        },
        [therapistUUID, buildUrl, fingerprint]
    )

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            isSuccess: false
        })
    }, [])

    return {
        ...state,
        book,
        reset
    }
}
