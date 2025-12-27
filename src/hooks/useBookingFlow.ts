import { useCallback, useMemo, useState } from 'react'
import type { AppointmentLocation, BookingResponse, ClientInfo, EnrichedTimeSlot, TimeSlot } from '../api-types'
import { useAvailableSlots } from './useAvailableSlots'
import { useBookAppointment } from './useBookAppointment'
import { useClaimSlot } from './useClaimSlot'
import { useTherapist } from './useTherapist'

type BookingStep = 'loading' | 'date-selection' | 'time-selection' | 'booking-form' | 'confirmation' | 'error'

type UseBookingFlowOptions = {
    /** Categories to filter by */
    categories?: number[]
    /** Callback when booking is complete */
    onBookingComplete?: (booking: BookingResponse) => void
    /** Callback on any error */
    onError?: (error: Error) => void
}

type UseBookingFlowReturn = {
    /** Current booking step */
    step: BookingStep
    /** Go to a specific step */
    goToStep: (step: BookingStep) => void

    /** Therapist information */
    therapist: ReturnType<typeof useTherapist>

    /** Available slots management */
    slots: ReturnType<typeof useAvailableSlots>

    /** Selected date */
    selectedDate: Date | null
    /** Select a date */
    selectDate: (date: Date | null) => void
    /** Slots for the selected date */
    selectedDateSlots: EnrichedTimeSlot[]

    /** Selected time slot */
    selectedSlot: TimeSlot | null
    /** Select a time slot (claims it) */
    selectSlot: (slot: TimeSlot | null) => Promise<boolean>

    /** Selected location (for not-fixed appointments) */
    selectedLocation: AppointmentLocation | null
    /** Set the location selection */
    setLocation: (location: AppointmentLocation) => void

    /** Claim state */
    claim: ReturnType<typeof useClaimSlot>

    /** Booking state */
    booking: ReturnType<typeof useBookAppointment>

    /** Submit booking with client info */
    submitBooking: (client: ClientInfo) => Promise<boolean>

    /** Start over from the beginning */
    reset: () => void

    /** Overall loading state */
    isLoading: boolean

    /** Current error if any */
    error: Error | null
}

/**
 * useBookingFlow - Complete booking flow orchestration
 *
 * A convenience hook that combines all booking hooks and manages
 * the booking flow state. Perfect for quickly building a booking UI.
 *
 * @example
 * ```tsx
 * function BookingPage() {
 *   const {
 *     step,
 *     therapist,
 *     slots,
 *     selectedDate,
 *     selectDate,
 *     selectedDateSlots,
 *     selectSlot,
 *     submitBooking,
 *     booking,
 *     reset
 *   } = useBookingFlow()
 *
 *   switch (step) {
 *     case 'loading':
 *       return <LoadingSpinner />
 *
 *     case 'date-selection':
 *       return (
 *         <DatePicker
 *           availableDates={slots.availableDates}
 *           onSelect={selectDate}
 *         />
 *       )
 *
 *     case 'time-selection':
 *       return (
 *         <TimeSlotPicker
 *           slots={selectedDateSlots}
 *           onSelect={selectSlot}
 *         />
 *       )
 *
 *     case 'booking-form':
 *       return (
 *         <BookingForm onSubmit={submitBooking} />
 *       )
 *
 *     case 'confirmation':
 *       return (
 *         <Confirmation
 *           booking={booking.booking}
 *           onReset={reset}
 *         />
 *       )
 *   }
 * }
 * ```
 */
export function useBookingFlow(options: UseBookingFlowOptions = {}): UseBookingFlowReturn {
    const { onBookingComplete, onError } = options

    const [step, setStep] = useState<BookingStep>('loading')
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
    const [selectedLocation, setSelectedLocation] = useState<AppointmentLocation | null>(null)

    const therapist = useTherapist()
    const slots = useAvailableSlots({ categories: options.categories })
    const claim = useClaimSlot()
    const booking = useBookAppointment()

    // Auto-advance from loading when data is ready
    useMemo(() => {
        if (step === 'loading' && !therapist.isLoading && !slots.isLoading) {
            if (therapist.error || slots.error) {
                setStep('error')
            } else {
                setStep('date-selection')
            }
        }
    }, [step, therapist.isLoading, slots.isLoading, therapist.error, slots.error])

    const selectedDateSlots = useMemo(() => {
        if (!selectedDate) return []
        return slots.getSlotsForDate(selectedDate)
    }, [selectedDate, slots])

    const selectDate = useCallback(
        (date: Date | null) => {
            setSelectedDate(date)
            setSelectedSlot(null)
            setSelectedLocation(null)

            if (date) {
                setStep('time-selection')
            }
        },
        [setSelectedDate, setSelectedSlot, setSelectedLocation, setStep]
    )

    const selectSlot = useCallback(
        async (slot: TimeSlot | null): Promise<boolean> => {
            if (!slot) {
                await claim.unclaim()
                setSelectedSlot(null)
                setSelectedLocation(null)
                return true
            }

            const response = await claim.claim(slot)

            if (!response) {
                if (claim.error) {
                    onError?.(claim.error)
                }
                return false
            }

            setSelectedSlot(slot)

            // Auto-set location if it's fixed
            if (slot.location !== 'not-fixed') {
                setSelectedLocation(slot.location)
            }

            setStep('booking-form')
            return true
        },
        [claim, onError]
    )

    const submitBooking = useCallback(
        async (client: ClientInfo): Promise<boolean> => {
            if (!selectedSlot) return false

            const result = await booking.book({
                slot: selectedSlot,
                client,
                locationSelection: selectedLocation ?? selectedSlot.location
            })

            if (!result) {
                if (booking.error) {
                    onError?.(booking.error)
                }
                return false
            }

            onBookingComplete?.(result)
            setStep('confirmation')
            return true
        },
        [selectedSlot, selectedLocation, booking, onBookingComplete, onError]
    )

    const reset = useCallback(() => {
        setStep('loading')
        setSelectedDate(null)
        setSelectedSlot(null)
        setSelectedLocation(null)
        booking.reset()
        claim.unclaim()
        slots.refetch()
    }, [booking, claim, slots])

    const goToStep = useCallback((newStep: BookingStep) => {
        setStep(newStep)
    }, [])

    const setLocation = useCallback((location: AppointmentLocation) => {
        setSelectedLocation(location)
    }, [])

    const isLoading = therapist.isLoading || slots.isLoading || claim.isLoading || booking.isLoading

    const error = therapist.error ?? slots.error ?? claim.error ?? booking.error

    return {
        step,
        goToStep,
        therapist,
        slots,
        selectedDate,
        selectDate,
        selectedDateSlots,
        selectedSlot,
        selectSlot,
        selectedLocation,
        setLocation,
        claim,
        booking,
        submitBooking,
        reset,
        isLoading,
        error
    }
}

