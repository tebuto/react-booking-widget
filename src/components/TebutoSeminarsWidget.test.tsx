import { render, screen } from '@testing-library/react'
import { TEBUTO_SEMINARS_WIDGET_NO_SCRIPT_TEXT, TEBUTO_SEMINARS_WIDGET_SCRIPT_URL } from '../constants'
import TebutoSeminarsWidget from './TebutoSeminarsWidget'

describe('TebutoSeminarsWidget', () => {
    const therapistUUID = '9fddab56-5dd5-4bc4-b1bd-3b1d52eb952f'

    it('should add a script tag to load the Tebuto Seminars Widget', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} />)

        const container = screen.getByTestId<HTMLDivElement>('tebuto-seminars-widget-container')

        expect(container).not.toBeNull()
        expect(container.childNodes).toHaveLength(2)

        // @ts-expect-error ts(2339)
        expect(container.childNodes[0].attributes['data-testid'].value).toBe('tebuto-seminars-widget-script')
        // @ts-expect-error ts(2339)
        expect(container.childNodes[1].attributes['data-testid'].value).toBe('tebuto-seminars-widget-noscript')

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script).not.toBeNull()
        expect(script.src).toBe(TEBUTO_SEMINARS_WIDGET_SCRIPT_URL)
        expect(script.dataset.therapistUuid).toBe(therapistUUID)

        const noscript = screen.getByTestId('tebuto-seminars-widget-noscript')
        expect(noscript).not.toBeNull()
        expect(noscript.textContent).toBe(TEBUTO_SEMINARS_WIDGET_NO_SCRIPT_TEXT)
    })

    it('should set the "data-background-color" attribute from the backgroundColor prop', () => {
        const backgroundColor = '#ffffff'
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} backgroundColor={backgroundColor} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.backgroundColor).toBe(backgroundColor)
    })

    it('should set the "data-border" attribute from the border prop', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} border={false} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.border).toBe('false')
    })

    it('should set the "data-seminars" attribute from the seminarSlugs prop', () => {
        const seminarSlugs = ['yoga', 'meditation']
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} seminarSlugs={seminarSlugs} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.seminars).toBe(seminarSlugs.join(','))
    })

    it('should not set data-seminars when seminarSlugs is empty', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} seminarSlugs={[]} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.seminars).toBeUndefined()
    })

    it('should set the "data-show-list-first" attribute when showListFirst is false', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} showListFirst={false} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.showListFirst).toBe('false')
    })

    it('should set the "data-show-list-first" attribute when showListFirst is true', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} showListFirst={true} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.showListFirst).toBe('true')
    })

    it('should set the noscript text from the noScriptText prop', () => {
        const noScriptText = 'Custom noscript text'
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} noScriptText={noScriptText} />)

        const noscript = screen.getByTestId('tebuto-seminars-widget-noscript')
        expect(noscript.textContent).toBe(noScriptText)
    })

    it('should set the "data-inherit-font" attribute when inheritFont is true', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} inheritFont={true} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.inheritFont).toBe('true')
    })

    it('should set theme attributes when theme is provided', () => {
        const theme = {
            primaryColor: '#3b82f6',
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            borderColor: '#e2e8f0'
        }
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} theme={theme} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.primaryColor).toBe(theme.primaryColor)
        expect(script.dataset.textPrimary).toBe(theme.textPrimary)
        expect(script.dataset.textSecondary).toBe(theme.textSecondary)
        expect(script.dataset.borderColor).toBe(theme.borderColor)
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
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} theme={theme} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.primaryColor).toBe(theme.primaryColor)
        expect(script.dataset.backgroundColor).toBe(theme.backgroundColor)
        expect(script.dataset.textPrimary).toBe(theme.textPrimary)
        expect(script.dataset.textSecondary).toBe(theme.textSecondary)
        expect(script.dataset.borderColor).toBe(theme.borderColor)
        expect(script.dataset.fontFamily).toBe(theme.fontFamily)
    })

    it('should prefer top-level backgroundColor over theme.backgroundColor', () => {
        const topLevelBg = '#ff0000'
        const themeBg = '#00ff00'
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} backgroundColor={topLevelBg} theme={{ backgroundColor: themeBg }} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.backgroundColor).toBe(topLevelBg)
    })

    it('should use theme.backgroundColor when top-level backgroundColor is not set', () => {
        const themeBg = '#00ff00'
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} theme={{ backgroundColor: themeBg }} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.backgroundColor).toBe(themeBg)
    })

    it('should prefer top-level inheritFont over theme.inheritFont', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} inheritFont={true} theme={{ inheritFont: false }} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.inheritFont).toBe('true')
    })

    it('should use theme.inheritFont when top-level inheritFont is not set', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} theme={{ inheritFont: true }} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.inheritFont).toBe('true')
    })

    it('should not set optional attributes when not provided', () => {
        render(<TebutoSeminarsWidget therapistUUID={therapistUUID} />)

        const script = screen.getByTestId<HTMLScriptElement>('tebuto-seminars-widget-script')
        expect(script.dataset.therapistUuid).toBe(therapistUUID)
        expect(script.dataset.backgroundColor).toBeUndefined()
        expect(script.dataset.seminars).toBeUndefined()
        expect(script.dataset.border).toBeUndefined()
        expect(script.dataset.showListFirst).toBeUndefined()
        expect(script.dataset.inheritFont).toBeUndefined()
        expect(script.dataset.primaryColor).toBeUndefined()
    })
})
