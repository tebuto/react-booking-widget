import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AsyncState, EnrichedTimeSlot, SlotsByDate, TimeSlot } from '../api-types'
import { useTebutoContext } from './TebutoProvider'

type UseAvailableSlotsOptions = {
    /** Auto-fetch on mount (default: true) */
    autoFetch?: boolean
    /** Filter by specific category IDs */
    categories?: number[]
}

type UseAvailableSlotsReturn = AsyncState<TimeSlot[]> & {
    /** Refetch available slots */
    refetch: () => Promise<void>
    /** Slots grouped by date (YYYY-MM-DD) */
    slotsByDate: SlotsByDate
    /** All unique dates with available slots */
    availableDates: Date[]
    /** Get enriched slots for a specific date */
    getSlotsForDate: (date: Date) => EnrichedTimeSlot[]
    /** All unique categories from available slots */
    categories: Array<{ id: number; name: string; color: string }>
    /** Total count of available slots */
    totalSlots: number
}

function formatDate(date: Date): string {
    // Use local date to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function enrichSlot(slot: TimeSlot): EnrichedTimeSlot {
    const startDate = new Date(slot.start)
    const endDate = new Date(slot.end)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const slotDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)

    return {
        ...slot,
        dateKey: formatDate(startDate),
        timeString: startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        durationMinutes,
        formattedPrice: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number.parseFloat(slot.price)),
        isToday: slotDay.getTime() === today.getTime(),
        isPast: startDate < now
    }
}

/**
 * useAvailableSlots - Fetch and manage available time slots
 *
 * Provides available appointment slots with helpers for grouping,
 * filtering, and date navigation.
 *
 * @example
 * ```tsx
 * const {
 *   slotsByDate,
 *   availableDates,
 *   getSlotsForDate,
 *   isLoading
 * } = useAvailableSlots()
 *
 * const [selectedDate, setSelectedDate] = useState<Date | null>(null)
 *
 * return (
 *   <div>
 *     <DatePicker dates={availableDates} onSelect={setSelectedDate} />
 *     {selectedDate && (
 *       <TimeSlotList slots={getSlotsForDate(selectedDate)} />
 *     )}
 *   </div>
 * )
 * ```
 */
export function useAvailableSlots(options: UseAvailableSlotsOptions = {}): UseAvailableSlotsReturn {
    const { autoFetch = true, categories: filterCategories } = options
    const { therapistUUID, buildUrl, categories: contextCategories } = useTebutoContext()

    const [state, setState] = useState<AsyncState<TimeSlot[]>>({
        data: null,
        isLoading: autoFetch,
        error: null
    })

    const categoriesToFilter = filterCategories ?? contextCategories

    const fetchSlots = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const url = new URL(buildUrl(`/events/${therapistUUID}`))

            if (categoriesToFilter && categoriesToFilter.length > 0) {
                url.searchParams.set('categories', categoriesToFilter.join(','))
            }

            const response = await fetch(url.toString())

            if (!response.ok) {
                throw new Error(`Failed to fetch slots: ${response.statusText}`)
            }

            const data = (await response.json()) as TimeSlot[]
            setState({ data, isLoading: false, error: null })
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error occurred')
            setState({ data: null, isLoading: false, error })
        }
    }, [therapistUUID, buildUrl, categoriesToFilter])

    useEffect(() => {
        if (autoFetch) {
            void fetchSlots()
        }
    }, [autoFetch, fetchSlots])

    const slotsByDate = useMemo<SlotsByDate>(() => {
        if (!state.data) return {}

        const grouped: SlotsByDate = {}
        const now = new Date()

        for (const slot of state.data) {
            const startDate = new Date(slot.start)

            if (startDate <= now) continue

            const dateKey = formatDate(startDate)

            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push(slot)
        }

        for (const dateKey in grouped) {
            grouped[dateKey].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        }

        return grouped
    }, [state.data])

    const availableDates = useMemo<Date[]>(() => {
        return Object.keys(slotsByDate)
            .map(dateStr => new Date(dateStr))
            .sort((a, b) => a.getTime() - b.getTime())
    }, [slotsByDate])

    const getSlotsForDate = useCallback(
        (date: Date): EnrichedTimeSlot[] => {
            const dateKey = formatDate(date)
            const slots = slotsByDate[dateKey] ?? []
            return slots.map(enrichSlot)
        },
        [slotsByDate]
    )

    const categories = useMemo(() => {
        if (!state.data) return []

        const categoryMap = new Map<number, { id: number; name: string; color: string }>()

        for (const slot of state.data) {
            if (!categoryMap.has(slot.eventCategoryId)) {
                categoryMap.set(slot.eventCategoryId, {
                    id: slot.eventCategoryId,
                    name: slot.title,
                    color: slot.color
                })
            }
        }

        return Array.from(categoryMap.values())
    }, [state.data])

    return {
        ...state,
        refetch: fetchSlots,
        slotsByDate,
        availableDates,
        getSlotsForDate,
        categories,
        totalSlots: state.data?.length ?? 0
    }
}

