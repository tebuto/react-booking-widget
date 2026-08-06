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
    'data-show-location-quick-filter'?: string
    'data-show-category-selection-first'?: string
    'data-show-therapist-profile'?: string
    'data-profile-url'?: string
    'data-inherit-font'?: string
    'data-primary-color'?: string
    'data-text-primary'?: string
    'data-text-secondary'?: string
    'data-border-color'?: string
    'data-font-family'?: string
}

function toDataBoolean(value: boolean): string {
    return value ? 'true' : 'false'
}

function setOptionalBooleanAttribute(attributes: DataAttributes, key: keyof DataAttributes, value: boolean | undefined): void {
    if (value !== undefined) {
        attributes[key] = toDataBoolean(value)
    }
}

function addBooleanAttributes(attributes: DataAttributes, config: TebutoBookingWidgetConfiguration): void {
    setOptionalBooleanAttribute(attributes, 'data-border', config.border)
    setOptionalBooleanAttribute(attributes, 'data-include-subusers', config.includeSubusers)
    setOptionalBooleanAttribute(attributes, 'data-show-quick-filters', config.showQuickFilters)
    setOptionalBooleanAttribute(attributes, 'data-show-location-quick-filter', config.showLocationQuickFilter)
    setOptionalBooleanAttribute(attributes, 'data-show-category-selection-first', config.showCategorySelectionFirst)
    setOptionalBooleanAttribute(attributes, 'data-show-therapist-profile', config.showTherapistProfile)
    setOptionalBooleanAttribute(attributes, 'data-inherit-font', config.inheritFont ?? config.theme?.inheritFont)
}

function buildDataAttributes(config: TebutoBookingWidgetConfiguration): DataAttributes {
    const attributes: DataAttributes = {
        'data-therapist-uuid': config.therapistUUID
    }

    const backgroundColor = config.backgroundColor ?? config.theme?.backgroundColor
    if (backgroundColor) {
        attributes['data-background-color'] = backgroundColor
    }

    if (config.categories && config.categories.length > 0) {
        attributes['data-categories'] = config.categories.join(',')
    }

    if (config.profileUrl) {
        attributes['data-profile-url'] = config.profileUrl
    }

    addBooleanAttributes(attributes, config)

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

function TebutoBookingWidgetScript({ config }: Readonly<{ config: TebutoBookingWidgetConfiguration }>): JSX.Element {
    const dataAttributes = buildDataAttributes(config)

    return <script src={TEBUTO_BOOKING_WIDGET_SCRIPT_URL} {...dataAttributes} data-testid="tebuto-booking-widget-script" />
}
