import { FormEvent, useState, useMemo } from 'react'
import type { AppointmentLocation, ClientInfo, EnrichedTimeSlot } from '../../api-types'
import { TebutoProvider, useBookingFlow } from '../../hooks'

/** CSS Variables for theming */
const cssVariables = {
    '--booking-bg': '#0f0f10',
    '--booking-surface': '#18181b',
    '--booking-surface-elevated': '#1f1f23',
    '--booking-surface-hover': '#27272a',
    '--booking-border': '#2d2d30',
    '--booking-border-subtle': '#232326',
    '--booking-text': '#fafafa',
    '--booking-text-secondary': '#d4d4d8',
    '--booking-text-muted': '#a1a1aa',
    '--booking-text-subtle': '#71717a',
    '--booking-accent': '#10b981',
    '--booking-accent-hover': '#34d399',
    '--booking-accent-muted': 'rgba(16, 185, 129, 0.12)',
    '--booking-accent-glow': 'rgba(16, 185, 129, 0.25)',
    '--booking-error': '#ef4444',
    '--booking-error-bg': 'rgba(239, 68, 68, 0.1)',
    '--booking-radius': '10px',
    '--booking-radius-sm': '6px',
    '--booking-radius-lg': '14px',
    '--booking-shadow': '0 4px 24px rgba(0, 0, 0, 0.4)',
    '--booking-transition': '0.15s ease',
    '--booking-font': '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
} as const

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`

// ============================================
// COMPONENTS
// ============================================

function Spinner() {
    return (
        <div
            style={{
                width: 32,
                height: 32,
                border: '2px solid var(--booking-border)',
                borderTopColor: 'var(--booking-accent)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite'
            }}
        />
    )
}

function LoadingState() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 80,
                gap: 16
            }}
        >
            <Spinner />
            <span style={{ color: 'var(--booking-text-muted)', fontSize: 14 }}>Verfügbare Termine werden geladen...</span>
        </div>
    )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            {Array.from({ length: total }, (_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                        style={{
                            width: i === current ? 28 : 10,
                            height: 10,
                            borderRadius: 5,
                            background: i <= current ? 'var(--booking-accent)' : 'var(--booking-border)',
                            transition: 'all 0.2s ease',
                            boxShadow: i === current ? '0 0 12px var(--booking-accent-glow)' : 'none'
                        }}
                    />
                </div>
            ))}
        </div>
    )
}

// ============================================
// CALENDAR COMPONENT
// ============================================

type CalendarProps = {
    availableDates: Date[]
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
}

function Calendar({ availableDates, selectedDate, onSelectDate }: CalendarProps) {
    const [viewDate, setViewDate] = useState(() => {
        // Start with the first available date's month, or current month
        return availableDates.length > 0 ? new Date(availableDates[0]) : new Date()
    })

    const availableDateSet = useMemo(() => {
        return new Set(availableDates.map(d => d.toDateString()))
    }, [availableDates])

    const { year, month, daysInMonth, firstDayOfWeek, weeks } = useMemo(() => {
        const year = viewDate.getFullYear()
        const month = viewDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        // Monday = 0, Sunday = 6 (European style)
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7

        const weeks: (number | null)[][] = []
        let currentWeek: (number | null)[] = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null)
        }

        for (let day = 1; day <= daysInMonth; day++) {
            currentWeek.push(day)
            if (currentWeek.length === 7) {
                weeks.push(currentWeek)
                currentWeek = []
            }
        }

        // Fill remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null)
            }
            weeks.push(currentWeek)
        }

        return { year, month, daysInMonth, firstDayOfWeek, weeks }
    }, [viewDate])

    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

    const goToPrevMonth = () => {
        setViewDate(new Date(year, month - 1, 1))
    }

    const goToNextMonth = () => {
        setViewDate(new Date(year, month + 1, 1))
    }

    const isDateAvailable = (day: number) => {
        const date = new Date(year, month, day)
        return availableDateSet.has(date.toDateString())
    }

    const isDateSelected = (day: number) => {
        if (!selectedDate) return false
        const date = new Date(year, month, day)
        return date.toDateString() === selectedDate.toDateString()
    }

    const isToday = (day: number) => {
        const today = new Date()
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    }

    const handleDateClick = (day: number) => {
        if (isDateAvailable(day)) {
            onSelectDate(new Date(year, month, day))
        }
    }

    // Check if we can navigate
    const today = new Date()
    const canGoPrev = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())

    return (
        <div>
            {/* Month Navigation */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                    padding: '0 4px'
                }}
            >
                <button
                    type="button"
                    onClick={goToPrevMonth}
                    disabled={!canGoPrev}
                    style={{
                        width: 36,
                        height: 36,
                        border: '1px solid var(--booking-border)',
                        borderRadius: 'var(--booking-radius-sm)',
                        background: 'var(--booking-surface)',
                        color: canGoPrev ? 'var(--booking-text)' : 'var(--booking-text-subtle)',
                        cursor: canGoPrev ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        transition: 'var(--booking-transition)',
                        opacity: canGoPrev ? 1 : 0.4
                    }}
                >
                    ‹
                </button>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--booking-text)' }}>
                    {monthNames[month]} {year}
                </span>
                <button
                    type="button"
                    onClick={goToNextMonth}
                    style={{
                        width: 36,
                        height: 36,
                        border: '1px solid var(--booking-border)',
                        borderRadius: 'var(--booking-radius-sm)',
                        background: 'var(--booking-surface)',
                        color: 'var(--booking-text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        transition: 'var(--booking-transition)'
                    }}
                >
                    ›
                </button>
            </div>

            {/* Weekday Headers */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 4,
                    marginBottom: 8
                }}
            >
                {dayNames.map(day => (
                    <div
                        key={day}
                        style={{
                            textAlign: 'center',
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--booking-text-subtle)',
                            padding: '8px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {week.map((day, dayIndex) => {
                            if (day === null) {
                                return <div key={dayIndex} style={{ aspectRatio: '1', minHeight: 44 }} />
                            }

                            const available = isDateAvailable(day)
                            const selected = isDateSelected(day)
                            const todayMark = isToday(day)

                            return (
                                <button
                                    key={dayIndex}
                                    type="button"
                                    onClick={() => handleDateClick(day)}
                                    disabled={!available}
                                    style={{
                                        aspectRatio: '1',
                                        minHeight: 44,
                                        border: selected
                                            ? '2px solid var(--booking-accent)'
                                            : todayMark
                                              ? '1px solid var(--booking-accent)'
                                              : '1px solid transparent',
                                        borderRadius: 'var(--booking-radius-sm)',
                                        background: selected
                                            ? 'var(--booking-accent)'
                                            : available
                                              ? 'var(--booking-surface-elevated)'
                                              : 'transparent',
                                        color: selected
                                            ? '#000'
                                            : available
                                              ? 'var(--booking-text)'
                                              : 'var(--booking-text-subtle)',
                                        cursor: available ? 'pointer' : 'default',
                                        fontSize: 14,
                                        fontWeight: selected ? 600 : available ? 500 : 400,
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'var(--booking-transition)',
                                        opacity: available ? 1 : 0.35,
                                        position: 'relative'
                                    }}
                                >
                                    {day}
                                    {available && !selected && (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                bottom: 6,
                                                width: 4,
                                                height: 4,
                                                borderRadius: '50%',
                                                background: 'var(--booking-accent)'
                                            }}
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: '1px solid var(--booking-border-subtle)',
                    fontSize: 12,
                    color: 'var(--booking-text-muted)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--booking-accent)'
                        }}
                    />
                    Termine verfügbar
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--booking-text-subtle)',
                            opacity: 0.35
                        }}
                    />
                    Keine Termine
                </div>
            </div>
        </div>
    )
}

// ============================================
// TIME SLOT PICKER
// ============================================

type TimeSlotPickerProps = {
    slots: EnrichedTimeSlot[]
    selectedSlot: EnrichedTimeSlot | null
    onSelectSlot: (slot: EnrichedTimeSlot) => void
    selectedDate: Date
    onBack: () => void
}

function TimeSlotPicker({ slots, selectedSlot, onSelectSlot, selectedDate, onBack }: TimeSlotPickerProps) {
    const getLocationIcon = (location: AppointmentLocation) => {
        switch (location) {
            case 'virtual':
                return '🎥'
            case 'onsite':
                return '📍'
            case 'not-fixed':
                return '🔄'
        }
    }

    const getLocationLabel = (location: AppointmentLocation) => {
        switch (location) {
            case 'virtual':
                return 'Online'
            case 'onsite':
                return 'Vor Ort'
            case 'not-fixed':
                return 'Flexibel'
        }
    }

    // Group slots by category
    const slotsByCategory = slots.reduce<Record<string, EnrichedTimeSlot[]>>((acc, slot) => {
        const key = slot.title
        if (!acc[key]) acc[key] = []
        acc[key].push(slot)
        return acc
    }, {})

    const formatDateLong = (date: Date) => {
        return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }

    return (
        <div>
            {/* Back button and date header */}
            <div style={{ marginBottom: 24 }}>
                <button
                    type="button"
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'none',
                        border: 'none',
                        color: 'var(--booking-text-muted)',
                        fontSize: 13,
                        cursor: 'pointer',
                        padding: '4px 0',
                        marginBottom: 12,
                        fontFamily: 'inherit',
                        transition: 'var(--booking-transition)'
                    }}
                >
                    ← Zurück zum Kalender
                </button>

                <h3
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: 'var(--booking-text)',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}
                >
                    <span
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--booking-radius-sm)',
                            background: 'var(--booking-accent-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18
                        }}
                    >
                        🕐
                    </span>
                    {formatDateLong(selectedDate)}
                </h3>
            </div>

            {/* Slots grouped by category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {Object.entries(slotsByCategory).map(([category, categorySlots]) => (
                    <div key={category}>
                        <h4
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--booking-text-secondary)',
                                margin: '0 0 12px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            <span
                                style={{
                                    width: 3,
                                    height: 14,
                                    borderRadius: 2,
                                    background: categorySlots[0]?.color || 'var(--booking-accent)'
                                }}
                            />
                            {category}
                        </h4>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: 12
                            }}
                        >
                            {categorySlots.map(slot => {
                                const isSelected = selectedSlot?.start === slot.start && selectedSlot?.eventRuleId === slot.eventRuleId

                                return (
                                    <button
                                        type="button"
                                        key={`${slot.start}-${slot.eventRuleId}`}
                                        onClick={() => onSelectSlot(slot)}
                                        style={{
                                            padding: '14px 16px',
                                            border: isSelected ? '2px solid var(--booking-accent)' : '1px solid var(--booking-border)',
                                            borderRadius: 'var(--booking-radius)',
                                            background: isSelected ? 'var(--booking-accent-muted)' : 'var(--booking-surface-elevated)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontFamily: 'inherit',
                                            transition: 'var(--booking-transition)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 12
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span
                                                style={{
                                                    fontSize: 17,
                                                    fontWeight: 600,
                                                    color: 'var(--booking-text)',
                                                    fontVariantNumeric: 'tabular-nums'
                                                }}
                                            >
                                                {slot.timeString}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--booking-text-subtle)',
                                                    background: 'var(--booking-surface)',
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0
                                                }}
                                            >
                                                {getLocationIcon(slot.location)} {getLocationLabel(slot.location)}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: 'var(--booking-accent)'
                                            }}
                                        >
                                            {slot.formattedPrice}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {slots.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: 40,
                        color: 'var(--booking-text-muted)'
                    }}
                >
                    Keine Termine an diesem Tag verfügbar.
                </div>
            )}
        </div>
    )
}

// ============================================
// BOOKING FORM
// ============================================

type BookingFormProps = {
    slot: EnrichedTimeSlot
    showLocationSelector: boolean
    selectedLocation: AppointmentLocation | null
    onLocationChange: (location: AppointmentLocation) => void
    onSubmit: (client: ClientInfo) => void
    onBack: () => void
    isLoading: boolean
    error: Error | null
}

function BookingForm({ slot, showLocationSelector, selectedLocation, onLocationChange, onSubmit, onBack, isLoading, error }: BookingFormProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: ''
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        onSubmit({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || undefined,
            notes: formData.notes || undefined
        })
    }

    const formatDateShort = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        })
    }

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        border: '1px solid var(--booking-border)',
        borderRadius: 'var(--booking-radius-sm)',
        background: 'var(--booking-bg)',
        color: 'var(--booking-text)',
        fontSize: 15,
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'var(--booking-transition)',
        boxSizing: 'border-box' as const
    }

    const labelStyle = {
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--booking-text-secondary)',
        marginBottom: 8,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.03em'
    }

    return (
        <div>
            {/* Back button */}
            <button
                type="button"
                onClick={onBack}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--booking-surface-elevated)',
                    border: '1px solid var(--booking-border)',
                    borderRadius: 'var(--booking-radius-sm)',
                    color: 'var(--booking-text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: '8px 14px',
                    marginBottom: 24,
                    fontFamily: 'inherit',
                    transition: 'var(--booking-transition)'
                }}
            >
                ← Zurück
            </button>

            {/* Appointment Summary Card - Full Width */}
            <div
                style={{
                    background: 'linear-gradient(135deg, var(--booking-accent-muted) 0%, var(--booking-surface-elevated) 100%)',
                    borderRadius: 'var(--booking-radius-lg)',
                    padding: 24,
                    marginBottom: 28,
                    border: '1px solid var(--booking-accent)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative accent */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 6,
                        height: '100%',
                        background: slot.color || 'var(--booking-accent)'
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    {/* Left: Title and details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 'var(--booking-radius)',
                                background: 'var(--booking-surface)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                                border: '1px solid var(--booking-border)'
                            }}
                        >
                            📅
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--booking-text)', marginBottom: 6 }}>{slot.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: 'var(--booking-text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ opacity: 0.7 }}>📆</span> {formatDateShort(slot.start)}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ opacity: 0.7 }}>🕐</span> {slot.timeString} Uhr
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ opacity: 0.7 }}>⏱</span> {slot.durationMinutes} Min.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Price */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--booking-text-muted)', marginBottom: 2 }}>Preis</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--booking-accent)' }}>{slot.formattedPrice}</div>
                    </div>
                </div>
            </div>

            {/* Location selector - if needed */}
            {showLocationSelector && (
                <div
                    style={{
                        background: 'var(--booking-surface-elevated)',
                        borderRadius: 'var(--booking-radius)',
                        padding: 20,
                        marginBottom: 28,
                        border: '1px solid var(--booking-border)'
                    }}
                >
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--booking-text)', marginBottom: 14 }}>
                        Wo soll der Termin stattfinden?
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {(['virtual', 'onsite'] as const).map(loc => (
                            <button
                                key={loc}
                                type="button"
                                onClick={() => onLocationChange(loc)}
                                style={{
                                    padding: '16px 20px',
                                    border: selectedLocation === loc ? '2px solid var(--booking-accent)' : '1px solid var(--booking-border)',
                                    borderRadius: 'var(--booking-radius)',
                                    background: selectedLocation === loc ? 'var(--booking-accent-muted)' : 'var(--booking-surface)',
                                    color: 'var(--booking-text)',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontSize: 15,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    transition: 'var(--booking-transition)'
                                }}
                            >
                                <span style={{ fontSize: 20 }}>{loc === 'virtual' ? '🎥' : '📍'}</span>
                                {loc === 'virtual' ? 'Online-Termin' : 'Vor Ort'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Form */}
            <div
                style={{
                    background: 'var(--booking-surface-elevated)',
                    borderRadius: 'var(--booking-radius-lg)',
                    padding: 28,
                    border: '1px solid var(--booking-border)'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        marginBottom: 24,
                        paddingBottom: 20,
                        borderBottom: '1px solid var(--booking-border)'
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--booking-radius-sm)',
                            background: 'var(--booking-accent-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20
                        }}
                    >
                        👤
                    </div>
                    <div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--booking-text)', margin: 0 }}>Ihre Kontaktdaten</h3>
                        <p style={{ fontSize: 13, color: 'var(--booking-text-muted)', margin: '4px 0 0 0' }}>
                            Wir benötigen diese Angaben für Ihre Terminbestätigung
                        </p>
                    </div>
                </div>

                {error && (
                    <div
                        style={{
                            background: 'var(--booking-error-bg)',
                            border: '1px solid var(--booking-error)',
                            borderRadius: 'var(--booking-radius-sm)',
                            padding: '14px 16px',
                            marginBottom: 20,
                            color: 'var(--booking-error)',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <span>⚠️</span> {error.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Vorname</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={e => setFormData(d => ({ ...d, firstName: e.target.value }))}
                                style={inputStyle}
                                placeholder="Max"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Nachname</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={e => setFormData(d => ({ ...d, lastName: e.target.value }))}
                                style={inputStyle}
                                placeholder="Mustermann"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>E-Mail-Adresse</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                            style={inputStyle}
                            placeholder="max@beispiel.de"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={{ ...labelStyle, color: 'var(--booking-text-muted)' }}>
                            Telefonnummer <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                            style={inputStyle}
                            placeholder="+49 123 456789"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={{ ...labelStyle, color: 'var(--booking-text-muted)' }}>
                            Nachricht <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))}
                            style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                            placeholder="Gibt es etwas, das wir vorab wissen sollten?"
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading || (showLocationSelector && !selectedLocation)}
                        style={{
                            marginTop: 8,
                            padding: '18px 32px',
                            border: 'none',
                            borderRadius: 'var(--booking-radius)',
                            background: 'var(--booking-accent)',
                            color: '#000',
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: isLoading || (showLocationSelector && !selectedLocation) ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                            transition: 'var(--booking-transition)',
                            opacity: isLoading || (showLocationSelector && !selectedLocation) ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            boxShadow: isLoading || (showLocationSelector && !selectedLocation) ? 'none' : '0 4px 14px var(--booking-accent-glow)'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Spinner /> Wird gebucht...
                            </>
                        ) : (
                            <>Termin verbindlich buchen</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

// ============================================
// CONFIRMATION
// ============================================

type ConfirmationProps = {
    slot: EnrichedTimeSlot
    onDownloadCalendar: () => void
    onReset: () => void
}

function Confirmation({ slot, onDownloadCalendar, onReset }: ConfirmationProps) {
    const formatDateLong = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--booking-accent-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    fontSize: 32,
                    border: '2px solid var(--booking-accent)'
                }}
            >
                ✓
            </div>

            <h2
                style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--booking-text)',
                    margin: '0 0 12px 0'
                }}
            >
                Termin gebucht!
            </h2>

            <p
                style={{
                    fontSize: 15,
                    color: 'var(--booking-text-muted)',
                    maxWidth: 400,
                    margin: '0 auto 32px',
                    lineHeight: 1.6
                }}
            >
                Ihr Termin <strong style={{ color: 'var(--booking-text)' }}>"{slot.title}"</strong> am{' '}
                <strong style={{ color: 'var(--booking-text)' }}>{formatDateLong(slot.start)}</strong> um{' '}
                <strong style={{ color: 'var(--booking-text)' }}>{slot.timeString} Uhr</strong> wurde erfolgreich gebucht.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    onClick={onDownloadCalendar}
                    style={{
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: 'var(--booking-radius-sm)',
                        background: 'var(--booking-accent)',
                        color: '#000',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    📅 Zum Kalender hinzufügen
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    style={{
                        padding: '12px 20px',
                        border: '1px solid var(--booking-border)',
                        borderRadius: 'var(--booking-radius-sm)',
                        background: 'transparent',
                        color: 'var(--booking-text)',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                    }}
                >
                    Weiteren Termin buchen
                </button>
            </div>
        </div>
    )
}

// ============================================
// MAIN BOOKING INTERFACE
// ============================================

function BookingInterface() {
    const {
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
        booking,
        submitBooking,
        reset,
        isLoading,
        error
    } = useBookingFlow()

    const getStepNumber = () => {
        switch (step) {
            case 'date-selection':
                return 0
            case 'time-selection':
                return 1
            case 'booking-form':
                return 2
            case 'confirmation':
                return 3
            default:
                return 0
        }
    }

    const handleSlotSelect = async (slot: EnrichedTimeSlot) => {
        await selectSlot(slot)
    }

    const enrichedSelectedSlot: EnrichedTimeSlot | null = selectedSlot
        ? {
              ...selectedSlot,
              dateKey: new Date(selectedSlot.start).toISOString().split('T')[0],
              timeString: new Date(selectedSlot.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
              durationMinutes: Math.round((new Date(selectedSlot.end).getTime() - new Date(selectedSlot.start).getTime()) / 60000),
              formattedPrice: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number.parseFloat(selectedSlot.price)),
              isToday: false,
              isPast: false
          }
        : null

    return (
        <div
            style={{
                ...cssVariables,
                fontFamily: 'var(--booking-font)',
                background: 'var(--booking-bg)',
                color: 'var(--booking-text)',
                minHeight: '100vh',
                padding: '40px 24px'
            }}
        >
            <style>{globalStyles}</style>

            <div style={{ maxWidth: 880, margin: '0 auto' }}>
                {/* Header */}
                <header style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            margin: '0 0 8px 0',
                            color: 'var(--booking-text)'
                        }}
                    >
                        Termin buchen{therapist.data ? ` bei ${therapist.data.name}` : ''}
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--booking-text-muted)', margin: 0 }}>
                        Wählen Sie einen passenden Termin für Ihr Anliegen
                    </p>
                </header>

                {/* Step indicator */}
                {step !== 'loading' && step !== 'error' && step !== 'confirmation' && <StepIndicator current={getStepNumber()} total={3} />}

                {/* Main card */}
                <div
                    style={{
                        background: 'var(--booking-surface)',
                        borderRadius: 'var(--booking-radius-lg)',
                        border: '1px solid var(--booking-border)',
                        boxShadow: 'var(--booking-shadow)',
                        overflow: 'hidden',
                        animation: 'fadeIn 0.3s ease'
                    }}
                >
                    <div style={{ padding: 28 }}>
                        {step === 'loading' && <LoadingState />}

                        {step === 'error' && (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <div
                                    style={{
                                        background: 'var(--booking-error-bg)',
                                        border: '1px solid var(--booking-error)',
                                        borderRadius: 'var(--booking-radius)',
                                        padding: 16,
                                        marginBottom: 20,
                                        color: 'var(--booking-error)'
                                    }}
                                >
                                    {error?.message ?? 'Ein Fehler ist aufgetreten'}
                                </div>
                                <button
                                    type="button"
                                    onClick={reset}
                                    style={{
                                        padding: '12px 24px',
                                        border: 'none',
                                        borderRadius: 'var(--booking-radius-sm)',
                                        background: 'var(--booking-accent)',
                                        color: '#000',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    Erneut versuchen
                                </button>
                            </div>
                        )}

                        {step === 'date-selection' && (
                            <div>
                                <h3
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: 'var(--booking-text)',
                                        margin: '0 0 20px 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 'var(--booking-radius-sm)',
                                            background: 'var(--booking-accent-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 18
                                        }}
                                    >
                                        📅
                                    </span>
                                    Datum wählen
                                </h3>
                                <Calendar availableDates={slots.availableDates} selectedDate={selectedDate} onSelectDate={selectDate} />
                            </div>
                        )}

                        {step === 'time-selection' && selectedDate && (
                            <TimeSlotPicker
                                slots={selectedDateSlots}
                                selectedSlot={
                                    selectedSlot
                                        ? {
                                              ...selectedSlot,
                                              dateKey: '',
                                              timeString: '',
                                              durationMinutes: 0,
                                              formattedPrice: '',
                                              isToday: false,
                                              isPast: false
                                          }
                                        : null
                                }
                                onSelectSlot={handleSlotSelect}
                                selectedDate={selectedDate}
                                onBack={() => goToStep('date-selection')}
                            />
                        )}

                        {step === 'booking-form' && enrichedSelectedSlot && (
                            <BookingForm
                                slot={enrichedSelectedSlot}
                                showLocationSelector={enrichedSelectedSlot.location === 'not-fixed'}
                                selectedLocation={selectedLocation}
                                onLocationChange={setLocation}
                                onSubmit={submitBooking}
                                onBack={() => goToStep('time-selection')}
                                isLoading={isLoading}
                                error={error}
                            />
                        )}

                        {step === 'confirmation' && enrichedSelectedSlot && (
                            <Confirmation slot={enrichedSelectedSlot} onDownloadCalendar={booking.downloadCalendar} onReset={reset} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// EXPORT
// ============================================

type CustomBookingExampleProps = {
    therapistUUID: string
    categories?: number[]
}

/**
 * CustomBookingExample - A modern, fully-featured booking interface
 *
 * This example demonstrates how to use the Tebuto hooks to build
 * a completely custom booking experience.
 *
 * @example
 * ```tsx
 * import { CustomBookingExample } from '@tebuto/react-booking-widget'
 *
 * function BookingPage() {
 *   return <CustomBookingExample therapistUUID="your-uuid" />
 * }
 * ```
 */
export function CustomBookingExample({ therapistUUID, categories }: CustomBookingExampleProps) {
    return (
        <TebutoProvider therapistUUID={therapistUUID} categories={categories}>
            <BookingInterface />
        </TebutoProvider>
    )
}
