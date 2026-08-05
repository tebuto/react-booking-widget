# Agent notes — @tebuto/react-booking-widget

This package is a **first-class consumer** of the hosted Tebuto widget embeds. Keep it in sync with the tebuto monorepo (`webapp/src/widget/`).

## Sync contract

When the booking or seminars embed contract changes in tebuto (`data-*` attributes, theme options, script URL, container id):

1. Update the matching component here (`TebutoBookingWidget` / `TebutoSeminarsWidget`).
2. Update Jest tests and Storybook.
3. Update the README props tables.
4. Merge/release, then bump the `react-booking-widget/` submodule pointer in the tebuto monorepo.

Source of truth for attribute names: `webapp/src/widget/booking-render.tsx` and `webapp/src/widget/seminars-render.tsx`.

## Local checks

```bash
pnpm test
pnpm lint
pnpm build
```
