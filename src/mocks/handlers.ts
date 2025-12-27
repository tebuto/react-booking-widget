import { HttpResponse, http } from 'msw'

// Mock therapist data
const mockTherapist = {
    name: 'Dr. Maria Müller',
    firstName: 'Maria',
    lastName: 'Müller',
    address: {
        streetAndNumber: 'Hauptstraße 42',
        additionalInformation: '2. OG',
        city: {
            name: 'München',
            zip: '80331'
        }
    },
    showWatermark: false
}

// Generate mock events
function generateMockEvents() {
    const events = []
    const now = new Date()
    const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Mock categories (location must be lowercase: 'virtual', 'onsite', 'not-fixed')
    const categories = [
        { id: 1, name: 'Erstgespräch', color: '#00b4a9', price: '80.00', location: 'onsite' },
        { id: 2, name: 'Einzeltherapie', color: '#3b82f6', price: '120.00', location: 'not-fixed' },
        { id: 3, name: 'Online-Beratung', color: '#8b5cf6', price: '90.00', location: 'virtual' }
    ]

    // Time slots throughout the day
    const times = [9, 10, 11, 14, 15, 16]

    // Generate events for today and the next 14 days (including weekends for demo)
    for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
        const date = new Date(baseDate)
        date.setDate(date.getDate() + dayOffset)

        // Generate 4-6 events per day
        const numEvents = 4 + (dayOffset % 3)

        for (let i = 0; i < numEvents && i < times.length; i++) {
            const hour = times[i]
            const category = categories[i % categories.length]

            const start = new Date(date)
            start.setHours(hour, 0, 0, 0)

            // Skip past times for today
            if (dayOffset === 0 && start <= now) continue

            const end = new Date(start)
            end.setMinutes(50)

            events.push({
                title: category.name,
                start: start.toISOString(),
                end: end.toISOString(),
                location: category.location,
                color: category.color,
                price: category.price,
                taxRate: '19',
                outageFeeEnabled: true,
                outageFeeHours: 24,
                outageFeePrice: 40,
                eventRuleId: dayOffset * 100 + hour,
                eventCategoryId: category.id,
                paymentEnabled: false,
                paymentDuringBooking: false,
                therapist: {
                    id: 1,
                    uuid: '00000000-0000-0000-0000-000000000000',
                    name: 'Dr. Maria Müller'
                }
            })
        }
    }

    return events
}

// Store claimed events
const claimedEvents = new Set<string>()

export const handlers = [
    // Get therapist by UUID
    http.get('https://api.tebuto.de/therapists/uuid/:uuid', () => {
        return HttpResponse.json(mockTherapist)
    }),

    // Get bookable events (with wildcard for fingerprint query param)
    http.get('https://api.tebuto.de/events/:uuid', ({ request }) => {
        console.log('[MSW] Intercepted events request:', request.url)
        const events = generateMockEvents()
        console.log('[MSW] Returning', events.length, 'events')
        return HttpResponse.json(events)
    }),

    // Claim an event slot
    http.post('https://api.tebuto.de/events/:uuid/claim', async ({ request }) => {
        const body = (await request.json()) as { start: string; end: string; eventRuleId: number }
        const key = `${body.start}-${body.eventRuleId}`
        claimedEvents.add(key)

        return HttpResponse.json({
            isAvailable: true,
            requirePhoneNumber: false,
            requireAddress: false
        })
    }),

    // Unclaim an event slot
    http.post('https://api.tebuto.de/events/:uuid/unclaim', async ({ request }) => {
        const body = (await request.json()) as { start: string; eventRuleId: number }
        const key = `${body.start}-${body.eventRuleId}`
        claimedEvents.delete(key)

        return HttpResponse.json({ success: true })
    }),

    // Get payment configuration
    http.get('https://api.tebuto.de/events/:uuid/payment-configuration', () => {
        return HttpResponse.json({
            paymentTypes: ['cash'],
            onlinePaymentMethods: []
        })
    }),

    // Book an event
    http.post('https://api.tebuto.de/events/:uuid/book', async ({ request }) => {
        const body = (await request.json()) as { start: string; eventRuleId: number; locationSelection: string }

        // Simulate a slight delay
        await new Promise(resolve => setTimeout(resolve, 500))

        return HttpResponse.json({
            id: Date.now(),
            createdAt: new Date().toISOString(),
            locationSelection: body.locationSelection,
            isConfirmed: true,
            isOutage: false,
            ics: 'BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR'
        })
    })
]
