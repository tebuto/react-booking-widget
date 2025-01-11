import { render, screen } from '@testing-library/react'
import { TEBUTO_BOOKING_WIDGET_NO_SCRIPT_TEXT, TEBUTO_BOOKING_WIDGET_SCRIPT_URL } from '../constants'
import TebutoBookingWidget from './TebutoBookingWidget'

describe('TebutoBookingWidget', () => {
    const therapistUUID = '9fddab56-5dd5-4bc4-b1bd-3b1d52eb952f'

    it('should add a script tag to load the Tebuto Booking Widget to the page head', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} />)

        const container = screen.getByTestId<HTMLDivElement>('tebuto-booking-widget-container')

        expect(container).not.toBeNull()
        expect(container.childNodes).toHaveLength(2)

        // @ts-expect-error ts(2339)
        expect(container.childNodes[0].attributes['data-testid'].value).toBe('tebuto-booking-widget-script')
        // @ts-expect-error ts(2339)
        expect(container.childNodes[1].attributes['data-testid'].value).toBe('tebuto-booking-widget-noscript')

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-booking-widget-script')
        expect(script).not.toBeNull()
        expect(script.src).toBe(TEBUTO_BOOKING_WIDGET_SCRIPT_URL)
        expect(script.getAttribute('data-therapist-uuid')).toBe(therapistUUID)

        const noscript = screen.getByTestId('tebuto-booking-widget-noscript')
        expect(noscript).not.toBeNull()
        expect(noscript.textContent).toBe(TEBUTO_BOOKING_WIDGET_NO_SCRIPT_TEXT)
    })

    it('should set the "data-background-color" attribute of the script tag to the value of the "backgroundColor" prop', () => {
        const backgroundColor = '#ffffff'
        render(<TebutoBookingWidget therapistUUID={therapistUUID} backgroundColor={backgroundColor} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-background-color')).toBe(backgroundColor)
    })

    it('should set the "data-border" attribute of the script tag to the value of the "border" prop', () => {
        const border = false
        render(<TebutoBookingWidget therapistUUID={therapistUUID} border={border} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-border')).toBe(border.toString())
    })

    it('should set the "data-categories" attribute of the script tag to the value of the "categories" prop', () => {
        const categories = [1, 2, 3]
        render(<TebutoBookingWidget therapistUUID={therapistUUID} categories={categories} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-categories')).toBe(categories.join(','))
    })

    it('should set the noscript text to the value of the "noScriptText" prop', () => {
        const noScriptText = 'This is the noscript text'
        render(<TebutoBookingWidget therapistUUID={therapistUUID} noScriptText={noScriptText} />)

        const noscript = screen.getByTestId('tebuto-booking-widget-noscript')
        expect(noscript.textContent).toBe(noScriptText)
    })
})
