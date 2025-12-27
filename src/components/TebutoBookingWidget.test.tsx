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

    it('should set the "data-include-subusers" attribute when includeSubusers is true', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} includeSubusers={true} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-include-subusers')).toBe('true')
    })

    it('should set the "data-include-subusers" attribute when includeSubusers is false', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} includeSubusers={false} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-include-subusers')).toBe('false')
    })

    it('should set the "data-show-quick-filters" attribute when showQuickFilters is true', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} showQuickFilters={true} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-show-quick-filters')).toBe('true')
    })

    it('should set the "data-inherit-font" attribute when inheritFont is true', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} inheritFont={true} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-inherit-font')).toBe('true')
    })

    it('should set theme attributes when theme is provided', () => {
        const theme = {
            primaryColor: '#3b82f6',
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            borderColor: '#e2e8f0'
        }
        render(<TebutoBookingWidget therapistUUID={therapistUUID} theme={theme} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-primary-color')).toBe(theme.primaryColor)
        expect(script.getAttribute('data-text-primary')).toBe(theme.textPrimary)
        expect(script.getAttribute('data-text-secondary')).toBe(theme.textSecondary)
        expect(script.getAttribute('data-border-color')).toBe(theme.borderColor)
    })

    it('should set all theme attributes when fully configured', () => {
        const theme = {
            primaryColor: '#00B4A9',
            backgroundColor: '#ffffff',
            textPrimary: '#374151',
            textSecondary: '#6b7280',
            borderColor: '#d1d5db',
            fontFamily: '"Montserrat", sans-serif'
        }
        render(<TebutoBookingWidget therapistUUID={therapistUUID} theme={theme} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-primary-color')).toBe(theme.primaryColor)
        expect(script.getAttribute('data-background-color')).toBe(theme.backgroundColor)
        expect(script.getAttribute('data-text-primary')).toBe(theme.textPrimary)
        expect(script.getAttribute('data-text-secondary')).toBe(theme.textSecondary)
        expect(script.getAttribute('data-border-color')).toBe(theme.borderColor)
        expect(script.getAttribute('data-font-family')).toBe(theme.fontFamily)
    })

    it('should prefer top-level backgroundColor over theme.backgroundColor', () => {
        const topLevelBg = '#ff0000'
        const themeBg = '#00ff00'
        render(<TebutoBookingWidget therapistUUID={therapistUUID} backgroundColor={topLevelBg} theme={{ backgroundColor: themeBg }} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-background-color')).toBe(topLevelBg)
    })

    it('should use theme.backgroundColor when top-level backgroundColor is not set', () => {
        const themeBg = '#00ff00'
        render(<TebutoBookingWidget therapistUUID={therapistUUID} theme={{ backgroundColor: themeBg }} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-background-color')).toBe(themeBg)
    })

    it('should prefer top-level inheritFont over theme.inheritFont', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} inheritFont={true} theme={{ inheritFont: false }} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-inherit-font')).toBe('true')
    })

    it('should use theme.inheritFont when top-level inheritFont is not set', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} theme={{ inheritFont: true }} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-inherit-font')).toBe('true')
    })

    it('should not set optional attributes when not provided', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-therapist-uuid')).toBe(therapistUUID)
        expect(script.getAttribute('data-background-color')).toBeNull()
        expect(script.getAttribute('data-categories')).toBeNull()
        expect(script.getAttribute('data-border')).toBeNull()
        expect(script.getAttribute('data-include-subusers')).toBeNull()
        expect(script.getAttribute('data-show-quick-filters')).toBeNull()
        expect(script.getAttribute('data-inherit-font')).toBeNull()
        expect(script.getAttribute('data-primary-color')).toBeNull()
    })

    it('should not set data-categories when categories array is empty', () => {
        render(<TebutoBookingWidget therapistUUID={therapistUUID} categories={[]} />)

        const script = screen.getByTestId('tebuto-booking-widget-script')
        expect(script.getAttribute('data-categories')).toBeNull()
    })
})
