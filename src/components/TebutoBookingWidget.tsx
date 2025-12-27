import { JSX } from 'react'
import { TEBUTO_BOOKING_WIDGET_ID, TEBUTO_BOOKING_WIDGET_NO_SCRIPT_TEXT, TEBUTO_BOOKING_WIDGET_SCRIPT_URL } from '../constants'
import { TebutoBookingWidgetConfiguration, TebutoWidgetTheme } from '../types'

type TebutoBookingWidgetProps = {
    noScriptText?: string
} & TebutoBookingWidgetConfiguration

export default function TebutoBookingWidget({ noScriptText = TEBUTO_BOOKING_WIDGET_NO_SCRIPT_TEXT, ...config }: TebutoBookingWidgetProps): JSX.Element {
    return (
        <div id={TEBUTO_BOOKING_WIDGET_ID} data-testid="tebuto-booking-widget-container">
            <TebutoBookingWidgetScript config={config} />
            <noscript data-testid="tebuto-booking-widget-noscript">{noScriptText}</noscript>
        </div>
    )
}

type DataAttributes = {
    'data-therapist-uuid': string
    'data-background-color'?: string
    'data-categories'?: string
    'data-border'?: string
    'data-include-subusers'?: string
    'data-show-quick-filters'?: string
    'data-inherit-font'?: string
    'data-primary-color'?: string
    'data-text-primary'?: string
    'data-text-secondary'?: string
    'data-border-color'?: string
    'data-font-family'?: string
}

function buildDataAttributes(config: TebutoBookingWidgetConfiguration): DataAttributes {
    const attributes: DataAttributes = {
        'data-therapist-uuid': config.therapistUUID
    }

    // Background color (top-level or from theme)
    const backgroundColor = config.backgroundColor ?? config.theme?.backgroundColor
    if (backgroundColor) {
        attributes['data-background-color'] = backgroundColor
    }

    // Categories
    if (config.categories && config.categories.length > 0) {
        attributes['data-categories'] = config.categories.join(',')
    }

    // Boolean options
    if (config.border !== undefined) {
        attributes['data-border'] = config.border ? 'true' : 'false'
    }

    if (config.includeSubusers !== undefined) {
        attributes['data-include-subusers'] = config.includeSubusers ? 'true' : 'false'
    }

    if (config.showQuickFilters !== undefined) {
        attributes['data-show-quick-filters'] = config.showQuickFilters ? 'true' : 'false'
    }

    // Inherit font (top-level or from theme)
    const inheritFont = config.inheritFont ?? config.theme?.inheritFont
    if (inheritFont !== undefined) {
        attributes['data-inherit-font'] = inheritFont ? 'true' : 'false'
    }

    // Theme colors
    if (config.theme) {
        addThemeAttributes(attributes, config.theme)
    }

    return attributes
}

function addThemeAttributes(attributes: DataAttributes, theme: TebutoWidgetTheme): void {
    if (theme.primaryColor) {
        attributes['data-primary-color'] = theme.primaryColor
    }

    if (theme.textPrimary) {
        attributes['data-text-primary'] = theme.textPrimary
    }

    if (theme.textSecondary) {
        attributes['data-text-secondary'] = theme.textSecondary
    }

    if (theme.borderColor) {
        attributes['data-border-color'] = theme.borderColor
    }

    if (theme.fontFamily) {
        attributes['data-font-family'] = theme.fontFamily
    }
}

function TebutoBookingWidgetScript({ config }: { config: TebutoBookingWidgetConfiguration }): JSX.Element {
    const dataAttributes = buildDataAttributes(config)

    return <script src={TEBUTO_BOOKING_WIDGET_SCRIPT_URL} {...dataAttributes} data-testid="tebuto-booking-widget-script" />
}
