import { JSX } from 'react'
import { TEBUTO_BOOKING_WIDGET_ID, TEBUTO_BOOKING_WIDGET_NO_SCRIPT_TEXT, TEBUTO_BOOKING_WIDGET_SCRIPT_URL } from '../constants'
import { TebutoBookingWidgetConfiguration } from '../types'

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

function TebutoBookingWidgetScript({ config }: { config: TebutoBookingWidgetConfiguration }): JSX.Element {
    return (
        <script
            src={TEBUTO_BOOKING_WIDGET_SCRIPT_URL}
            data-therapist-uuid={config.therapistUUID}
            {...(config.backgroundColor ? { 'data-background-color': config.backgroundColor } : {})}
            {...(config.categories ? { 'data-categories': config.categories.join(',') } : {})}
            {...(config.border !== undefined ? { 'data-border': config.border ? 'true' : 'false' } : {})}
            data-testid="tebuto-booking-widget-script"
        />
    )
}
