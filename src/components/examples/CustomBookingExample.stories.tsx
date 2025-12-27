import type { Meta, StoryObj } from '@storybook/react'
import { CustomBookingExample } from './CustomBookingExample'

/**
 * Demo UUID that works with the MSW mock handlers.
 */
const DEMO_THERAPIST_UUID = '00000000-0000-0000-0000-000000000000'

const meta: Meta<typeof CustomBookingExample> = {
    title: 'Custom Booking/Example',
    component: CustomBookingExample,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
# Custom Booking Interface

This is a complete example of building a custom booking interface using the Tebuto hooks.

## Hooks Used

- **TebutoProvider** - Wraps the app and provides configuration context
- **useBookingFlow** - Orchestrates the entire booking flow
- **useTherapist** - Fetches therapist information
- **useAvailableSlots** - Manages available time slots
- **useClaimSlot** - Handles slot claiming/reservation
- **useBookAppointment** - Completes the booking process

## Build Your Own

You can also use the hooks individually to build a completely custom experience:

\`\`\`tsx
import { 
  TebutoProvider, 
  useTherapist, 
  useAvailableSlots, 
  useClaimSlot, 
  useBookAppointment 
} from '@tebuto/react-booking-widget'

function MyCustomBooking() {
  const therapist = useTherapist()
  const slots = useAvailableSlots()
  const { claim, unclaim, claimedSlot } = useClaimSlot()
  const { book, isLoading, isSuccess } = useBookAppointment()

  // Build your own UI with these hooks!
}

function App() {
  return (
    <TebutoProvider therapistUUID="your-uuid">
      <MyCustomBooking />
    </TebutoProvider>
  )
}
\`\`\`
`
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        therapistUUID: {
            control: 'text',
            description: 'UUID of the therapist (required)'
        },
        categories: {
            control: 'object',
            description: 'Filter appointments by category IDs'
        }
    }
}

export default meta
type Story = StoryObj<typeof CustomBookingExample>

/**
 * The default custom booking experience with a modern dark theme
 * and smooth user flow through date selection, time selection,
 * booking form, and confirmation.
 */
export const Default: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID
    }
}

