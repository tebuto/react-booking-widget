/**
 * Theme configuration for the Tebuto Booking Widget.
 * All colors should be valid CSS color strings (e.g., '#00B4A9', 'rgb(0, 180, 169)').
 *
 * Note: The widget automatically generates color variations (light, dark, etc.)
 * from the primaryColor, so only the base colors need to be configured.
 */
export type TebutoWidgetTheme = {
    /** Primary brand color - used for buttons, highlights, selected states */
    primaryColor?: string
    /** Main widget background color */
    backgroundColor?: string
    /** Main text color */
    textPrimary?: string
    /** Secondary/muted text color */
    textSecondary?: string
    /** General border color */
    borderColor?: string
    /** Widget font family */
    fontFamily?: string
    /** Inherit font from parent page instead of using widget font */
    inheritFont?: boolean
}

/**
 * Configuration options for the Tebuto Booking Widget.
 */
export type TebutoBookingWidgetConfiguration = {
    /** UUID of the therapist whose calendar should be displayed (required) */
    therapistUUID: string
    /** Background color of the widget (shorthand for theme.backgroundColor) */
    backgroundColor?: string
    /** Array of category IDs to filter available appointments */
    categories?: number[]
    /** Whether to display a border around the widget (default: true) */
    border?: boolean
    /** Include subuser appointments in the calendar (default: false) */
    includeSubusers?: boolean
    /** Show quick filter buttons for time slots (default: false) */
    showQuickFilters?: boolean
    /** Inherit font from parent page instead of using widget font (default: false) */
    inheritFont?: boolean
    /** Theme configuration for customizing colors and fonts */
    theme?: TebutoWidgetTheme
}
