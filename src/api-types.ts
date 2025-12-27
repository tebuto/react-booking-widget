/**
 * API Types for Tebuto Booking Hooks
 * These types represent the data structures returned by the Tebuto API.
 */

/** Location type for appointments */
export type AppointmentLocation = 'virtual' | 'onsite' | 'not-fixed'

/** Address structure for therapist/location */
export type Address = {
    streetAndNumber: string
    additionalInformation?: string
    city: {
        name: string
        zip: string
    }
}

/** Therapist information */
export type Therapist = {
    name: string
    firstName: string
    lastName: string
    address: Address
    showWatermark: boolean
}

/** Therapist reference in events */
export type TherapistReference = {
    id: number
    uuid: string
    name: string
}

/** Available time slot / event */
export type TimeSlot = {
    title: string
    start: string
    end: string
    location: AppointmentLocation
    color: string
    price: string
    taxRate: string
    outageFeeEnabled: boolean
    outageFeeHours: number
    outageFeePrice: number
    eventRuleId: number
    eventCategoryId: number
    paymentEnabled: boolean
    paymentDuringBooking: boolean
    therapist: TherapistReference
}

/** Response from claim endpoint */
export type ClaimResponse = {
    isAvailable: boolean
    requirePhoneNumber: boolean
    requireAddress: boolean
}

/** Payment configuration */
export type PaymentConfiguration = {
    paymentTypes: string[]
    onlinePaymentMethods: string[]
}

/** Client information for booking */
export type ClientInfo = {
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: {
        streetAndNumber: string
        additionalInformation?: string
        city: string
        zip: string
    }
    notes?: string
}

/** Booking request payload */
export type BookingRequest = {
    start: string
    end: string
    eventRuleId: number
    locationSelection: AppointmentLocation
    client: ClientInfo
}

/** Booking response */
export type BookingResponse = {
    id: number
    createdAt: string
    locationSelection: AppointmentLocation
    isConfirmed: boolean
    isOutage: boolean
    ics: string
}

/** Hook state for async operations */
export type AsyncState<T> = {
    data: T | null
    isLoading: boolean
    error: Error | null
}

/** Category for filtering */
export type EventCategory = {
    id: number
    name: string
    color: string
    price: string
    location: AppointmentLocation
}

/** Grouped time slots by date */
export type SlotsByDate = {
    [date: string]: TimeSlot[]
}

/** Time slot with additional computed properties */
export type EnrichedTimeSlot = TimeSlot & {
    dateKey: string
    timeString: string
    durationMinutes: number
    formattedPrice: string
    isToday: boolean
    isPast: boolean
}
