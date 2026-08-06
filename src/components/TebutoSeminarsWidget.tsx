import { JSX } from 'react'
import { TEBUTO_SEMINARS_WIDGET_ID, TEBUTO_SEMINARS_WIDGET_NO_SCRIPT_TEXT, TEBUTO_SEMINARS_WIDGET_SCRIPT_URL } from '../constants'
import { TebutoSeminarsWidgetConfiguration, TebutoWidgetTheme } from '../types'

type TebutoSeminarsWidgetProps = {
    noScriptText?: string
} & TebutoSeminarsWidgetConfiguration

export default function TebutoSeminarsWidget({ noScriptText = TEBUTO_SEMINARS_WIDGET_NO_SCRIPT_TEXT, ...config }: TebutoSeminarsWidgetProps): JSX.Element {
    return (
        <div id={TEBUTO_SEMINARS_WIDGET_ID} data-testid="tebuto-seminars-widget-container">
            <TebutoSeminarsWidgetScript config={config} />
            <noscript data-testid="tebuto-seminars-widget-noscript">{noScriptText}</noscript>
        </div>
    )
}

type DataAttributes = {
    'data-therapist-uuid': string
    'data-background-color'?: string
    'data-seminars'?: string
    'data-border'?: string
    'data-show-list-first'?: string
    'data-inherit-font'?: string
    'data-primary-color'?: string
    'data-text-primary'?: string
    'data-text-secondary'?: string
    'data-border-color'?: string
    'data-font-family'?: string
}

function addBooleanAttributes(attributes: DataAttributes, config: TebutoSeminarsWidgetConfiguration): void {
    if (config.border !== undefined) {
        attributes['data-border'] = config.border ? 'true' : 'false'
    }

    if (config.showListFirst !== undefined) {
        attributes['data-show-list-first'] = config.showListFirst ? 'true' : 'false'
    }

    const inheritFont = config.inheritFont ?? config.theme?.inheritFont
    if (inheritFont !== undefined) {
        attributes['data-inherit-font'] = inheritFont ? 'true' : 'false'
    }
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

function buildDataAttributes(config: TebutoSeminarsWidgetConfiguration): DataAttributes {
    const attributes: DataAttributes = {
        'data-therapist-uuid': config.therapistUUID
    }

    const backgroundColor = config.backgroundColor ?? config.theme?.backgroundColor
    if (backgroundColor) {
        attributes['data-background-color'] = backgroundColor
    }

    if (config.seminarSlugs && config.seminarSlugs.length > 0) {
        attributes['data-seminars'] = config.seminarSlugs.join(',')
    }

    addBooleanAttributes(attributes, config)

    if (config.theme) {
        addThemeAttributes(attributes, config.theme)
    }

    return attributes
}

function TebutoSeminarsWidgetScript({ config }: Readonly<{ config: TebutoSeminarsWidgetConfiguration }>): JSX.Element {
    const dataAttributes = buildDataAttributes(config)

    return <script src={TEBUTO_SEMINARS_WIDGET_SCRIPT_URL} {...dataAttributes} data-testid="tebuto-seminars-widget-script" />
}
