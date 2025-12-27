<div align="center">
  <img alt="Tebuto" src="https://tebuto.de/assets/logo.svg" width="400" />
</div>

<p align="center">A <a href="https://react.dev" target="_blank">React</a> library for integrating <a href="https://tebuto.de" target="_blank">Tebuto</a> appointment booking into your website.</p>

<div align="center">
  <a href="https://www.npmjs.com/package/@tebuto/react-booking-widget"><img alt="NPM Version" src="https://img.shields.io/npm/v/%40tebuto%2Freact-booking-widget"></a>
  <a href="https://github.com/tebuto/react-booking-widget/blob/main/LICENSE"><img alt="MIT License" src="https://img.shields.io/npm/l/%40tebuto%2Freact-booking-widget"></a>
  <a href="https://github.com/tebuto/react-booking-widget/actions/workflows/branch.yaml"><img alt="CI Status" src="https://img.shields.io/github/actions/workflow/status/tebuto/react-booking-widget/.github%2Fworkflows%2Fbranch.yaml?label=CI&logo=GitHub"></a>
</div>

<hr />

## Table of Contents <!-- omit in toc -->

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Widget Configuration](#widget-configuration)
  - [Props Reference](#props-reference)
  - [Theme Configuration](#theme-configuration)
- [Building Custom Booking UIs](#building-custom-booking-uis)
  - [TebutoProvider](#tebutoprovider)
  - [useBookingFlow Hook](#usebookingflow-hook)
  - [Individual Hooks](#individual-hooks)
    - [useTherapist](#usetherapist)
    - [useAvailableSlots](#useavailableslots)
    - [useClaimSlot](#useclaimslot)
    - [useBookAppointment](#usebookappointment)
  - [Custom Booking Example](#custom-booking-example)
- [API Types](#api-types)
- [License](#license)

## Features

- **Drop-in Widget** - Embed the Tebuto booking widget with a single component
- **Custom Booking UIs** - Build your own booking interface with powerful React hooks
- **Full TypeScript Support** - Complete type definitions for all APIs
- **Theming** - Customize colors, fonts, and styles to match your brand
- **React 19 Compatible** - Built for the latest React version

## Installation

```bash
# npm
npm install @tebuto/react-booking-widget

# pnpm
pnpm add @tebuto/react-booking-widget

# yarn
yarn add @tebuto/react-booking-widget
```

**Requirements:** React 19.0.0 or higher

## Quick Start

The simplest way to add Tebuto booking to your site:

```tsx
import { TebutoBookingWidget } from "@tebuto/react-booking-widget";

function BookingPage() {
  return <TebutoBookingWidget therapistUUID="your-therapist-uuid" />;
}
```

> **Note:** You can obtain the therapist UUID from the [appointment settings](https://app.tebuto.de/einstellungen/termine). In the embedding section, click on the HTML button and use the value from the `data-therapist-uuid` attribute.

## Widget Configuration

### Props Reference

| Prop               | Type                | Required | Default         | Description                                 |
| ------------------ | ------------------- | -------- | --------------- | ------------------------------------------- |
| `therapistUUID`    | `string`            | Yes      | -               | Unique identifier for the therapist         |
| `backgroundColor`  | `string`            | No       | `transparent`   | Background color (hex, rgb, etc.)           |
| `border`           | `boolean`           | No       | `true`          | Show border around the widget               |
| `categories`       | `number[]`          | No       | `[]`            | Filter appointments by category IDs         |
| `includeSubusers`  | `boolean`           | No       | `false`         | Include subuser appointments                |
| `showQuickFilters` | `boolean`           | No       | `false`         | Show quick filter buttons for time slots    |
| `inheritFont`      | `boolean`           | No       | `false`         | Use parent page font instead of widget font |
| `theme`            | `TebutoWidgetTheme` | No       | -               | Theme customization object                  |
| `noScriptText`     | `string`            | No       | Default message | Text shown when JavaScript is disabled      |

### Theme Configuration

Customize the widget appearance with the `theme` prop:

```tsx
import { TebutoBookingWidget } from "@tebuto/react-booking-widget";

function BookingPage() {
  return (
    <TebutoBookingWidget
      therapistUUID="your-uuid"
      theme={{
        primaryColor: "#10b981",
        backgroundColor: "#0f0f10",
        textPrimary: "#fafafa",
        textSecondary: "#a1a1aa",
        borderColor: "#2d2d30",
        fontFamily: '"Inter", sans-serif',
        inheritFont: false,
      }}
    />
  );
}
```

| Theme Property    | Type      | Description                                 |
| ----------------- | --------- | ------------------------------------------- |
| `primaryColor`    | `string`  | Primary brand color for buttons, highlights |
| `backgroundColor` | `string`  | Main widget background                      |
| `textPrimary`     | `string`  | Primary text color                          |
| `textSecondary`   | `string`  | Secondary/muted text color                  |
| `borderColor`     | `string`  | Border color                                |
| `fontFamily`      | `string`  | Font family for the widget                  |
| `inheritFont`     | `boolean` | Inherit font from parent page               |

## Building Custom Booking UIs

For complete control over your booking interface, use the provided hooks to build a custom implementation.

### TebutoProvider

Wrap your booking components with `TebutoProvider` to share configuration:

```tsx
import { TebutoProvider } from "@tebuto/react-booking-widget";

function App() {
  return (
    <TebutoProvider
      therapistUUID="your-uuid"
      categories={[1, 2, 3]}
      includeSubusers={false}
    >
      <YourCustomBookingUI />
    </TebutoProvider>
  );
}
```

| Prop              | Type       | Required | Description          |
| ----------------- | ---------- | -------- | -------------------- |
| `therapistUUID`   | `string`   | Yes      | Therapist identifier |
| `apiBaseUrl`      | `string`   | No       | Custom API base URL  |
| `categories`      | `number[]` | No       | Category filter      |
| `includeSubusers` | `boolean`  | No       | Include subusers     |

### useBookingFlow Hook

The `useBookingFlow` hook provides complete booking flow orchestration:

```tsx
import { TebutoProvider, useBookingFlow } from "@tebuto/react-booking-widget";

function BookingUI() {
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
    submitBooking,
    booking,
    reset,
    isLoading,
    error,
  } = useBookingFlow({
    onBookingComplete: (booking) => console.log("Booked!", booking),
    onError: (error) => console.error("Error:", error),
  });

  switch (step) {
    case "loading":
      return <LoadingSpinner />;

    case "date-selection":
      return (
        <DatePicker
          availableDates={slots.availableDates}
          onSelect={selectDate}
        />
      );

    case "time-selection":
      return <TimeSlotPicker slots={selectedDateSlots} onSelect={selectSlot} />;

    case "booking-form":
      return <BookingForm onSubmit={submitBooking} isLoading={isLoading} />;

    case "confirmation":
      return (
        <Confirmation
          booking={booking.booking}
          onDownloadCalendar={booking.downloadCalendar}
          onReset={reset}
        />
      );

    case "error":
      return <ErrorDisplay error={error} onRetry={reset} />;
  }
}

function App() {
  return (
    <TebutoProvider therapistUUID="your-uuid">
      <BookingUI />
    </TebutoProvider>
  );
}
```

### Individual Hooks

For fine-grained control, use the individual hooks:

#### useTherapist

Fetch therapist information:

```tsx
const { data, isLoading, error, refetch } = useTherapist();
// data: { name, firstName, lastName, address, showWatermark }
```

#### useAvailableSlots

Fetch and manage available time slots:

```tsx
const {
  slots, // All available slots
  slotsByDate, // Slots grouped by date
  availableDates, // Array of dates with availability
  getSlotsForDate, // Get slots for a specific date
  isLoading,
  error,
  refetch,
} = useAvailableSlots({ categories: [1, 2] });
```

#### useClaimSlot

Claim (reserve) a time slot before booking:

```tsx
const {
  claim, // Claim a slot
  unclaim, // Release claimed slot
  claimData, // Claim response data
  isLoading,
  error,
} = useClaimSlot();

// Claim a slot
const response = await claim(selectedSlot);
// response: { isAvailable, requirePhoneNumber, requireAddress }
```

#### useBookAppointment

Complete the booking:

```tsx
const {
  book, // Submit booking
  booking, // Booking response
  downloadCalendar, // Download ICS file
  reset, // Reset state
  isLoading,
  error,
} = useBookAppointment();

// Book appointment
const result = await book({
  slot: selectedSlot,
  client: {
    firstName: "Max",
    lastName: "Mustermann",
    email: "max@example.com",
    phone: "+49123456789", // optional
    notes: "First appointment", // optional
  },
  locationSelection: "onsite", // 'virtual' | 'onsite' | 'not-fixed'
});
```

### Custom Booking Example

The library includes a full example implementation:

```tsx
import { CustomBookingExample } from "@tebuto/react-booking-widget";

function BookingPage() {
  return <CustomBookingExample therapistUUID="your-uuid" categories={[1, 2]} />;
}
```

## API Types

All types are exported for TypeScript users:

```tsx
import type {
  // Configuration
  TebutoBookingWidgetConfiguration,
  TebutoWidgetTheme,

  // API Data
  Therapist,
  TimeSlot,
  EnrichedTimeSlot,
  ClaimResponse,
  BookingRequest,
  BookingResponse,
  ClientInfo,

  // Utilities
  AppointmentLocation, // 'virtual' | 'onsite' | 'not-fixed'
  Address,
  SlotsByDate,
  AsyncState,
} from "@tebuto/react-booking-widget";
```

## License

[MIT](LICENSE)
