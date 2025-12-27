import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useRef, useState } from 'react'
import { TEBUTO_BOOKING_WIDGET_SCRIPT_URL } from '../constants'
import { TebutoBookingWidgetConfiguration } from '../types'
import TebutoBookingWidget from './TebutoBookingWidget'

/**
 * Live preview component that loads and renders the actual Tebuto widget.
 * MSW (Mock Service Worker) intercepts API calls to provide mock data.
 * 
 * Important: The widget reads config from the SCRIPT tag's data attributes,
 * not from a div. So we set them on the script element.
 */
function LiveWidgetPreview(props: TebutoBookingWidgetConfiguration) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!containerRef.current) return

        setLoading(true)
        setError(null)

        // Clear previous content
        containerRef.current.innerHTML = ''

        // Create the widget container div (required by the widget)
        const widgetDiv = document.createElement('div')
        widgetDiv.id = 'tebuto-booking-widget'
        containerRef.current.appendChild(widgetDiv)

        // Load the widget script with data attributes ON THE SCRIPT TAG
        const script = document.createElement('script')
        script.src = TEBUTO_BOOKING_WIDGET_SCRIPT_URL
        script.async = true

        // Set data attributes on the SCRIPT tag (this is how the widget reads config)
        script.setAttribute('data-therapist-uuid', props.therapistUUID)

        const backgroundColor = props.backgroundColor ?? props.theme?.backgroundColor
        if (backgroundColor) script.setAttribute('data-background-color', backgroundColor)

        if (props.categories && props.categories.length > 0) {
            script.setAttribute('data-categories', props.categories.join(','))
        }

        if (props.border !== undefined) script.setAttribute('data-border', String(props.border))
        if (props.includeSubusers !== undefined) script.setAttribute('data-include-subusers', String(props.includeSubusers))
        if (props.showQuickFilters !== undefined) script.setAttribute('data-show-quick-filters', String(props.showQuickFilters))

        const inheritFont = props.inheritFont ?? props.theme?.inheritFont
        if (inheritFont !== undefined) script.setAttribute('data-inherit-font', String(inheritFont))

        if (props.theme) {
            if (props.theme.primaryColor) script.setAttribute('data-primary-color', props.theme.primaryColor)
            if (props.theme.textPrimary) script.setAttribute('data-text-primary', props.theme.textPrimary)
            if (props.theme.textSecondary) script.setAttribute('data-text-secondary', props.theme.textSecondary)
            if (props.theme.borderColor) script.setAttribute('data-border-color', props.theme.borderColor)
            if (props.theme.fontFamily) script.setAttribute('data-font-family', props.theme.fontFamily)
        }

        script.onload = () => {
            setLoading(false)
        }

        script.onerror = () => {
            setError('Failed to load the Tebuto booking widget script')
            setLoading(false)
        }

        containerRef.current.appendChild(script)

        return () => {
            // Cleanup
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }
        }
    }, [props])

    return (
        <div style={{ minHeight: '600px', width: '100%' }}>
            {loading && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '48px',
                        color: '#6b7280'
                    }}
                >
                    Loading widget...
                </div>
            )}
            {error && (
                <div
                    style={{
                        padding: '24px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#dc2626'
                    }}
                >
                    <strong>Error:</strong> {error}
                </div>
            )}
            <div ref={containerRef} style={{ width: '100%' }} />
        </div>
    )
}

/**
 * Component that shows the generated HTML code for the widget.
 */
function GeneratedCodePreview(props: TebutoBookingWidgetConfiguration) {
    const buildDataAttributes = (config: TebutoBookingWidgetConfiguration): string[] => {
        const attrs: string[] = [`data-therapist-uuid="${config.therapistUUID}"`]

        const backgroundColor = config.backgroundColor ?? config.theme?.backgroundColor
        if (backgroundColor) attrs.push(`data-background-color="${backgroundColor}"`)
        if (config.categories && config.categories.length > 0) {
            attrs.push(`data-categories="${config.categories.join(',')}"`)
        }
        if (config.border !== undefined) attrs.push(`data-border="${config.border}"`)
        if (config.includeSubusers !== undefined) attrs.push(`data-include-subusers="${config.includeSubusers}"`)
        if (config.showQuickFilters !== undefined) attrs.push(`data-show-quick-filters="${config.showQuickFilters}"`)

        const inheritFont = config.inheritFont ?? config.theme?.inheritFont
        if (inheritFont !== undefined) attrs.push(`data-inherit-font="${inheritFont}"`)

        if (config.theme) {
            if (config.theme.primaryColor) attrs.push(`data-primary-color="${config.theme.primaryColor}"`)
            if (config.theme.textPrimary) attrs.push(`data-text-primary="${config.theme.textPrimary}"`)
            if (config.theme.textSecondary) attrs.push(`data-text-secondary="${config.theme.textSecondary}"`)
            if (config.theme.borderColor) attrs.push(`data-border-color="${config.theme.borderColor}"`)
            if (config.theme.fontFamily) attrs.push(`data-font-family="${config.theme.fontFamily}"`)
        }

        return attrs
    }

    const attrs = buildDataAttributes(props)
    const code = `<div id="tebuto-booking-widget"></div>
<script
  src="${TEBUTO_BOOKING_WIDGET_SCRIPT_URL}"
  ${attrs.join('\n  ')}
></script>`

    return (
        <div style={{ marginTop: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151', fontWeight: 600 }}>📋 Embed Code</h4>
            <pre
                style={{
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    overflow: 'auto',
                    margin: 0,
                    lineHeight: 1.5
                }}
            >
                <code>{code}</code>
            </pre>
        </div>
    )
}

/**
 * Combined preview showing live widget and generated code.
 */
function WidgetStoryPreview(props: TebutoBookingWidgetConfiguration & { showCode?: boolean }) {
    const { showCode = true, ...widgetProps } = props

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '960px' }}>
            <LiveWidgetPreview {...widgetProps} />
            {showCode && <GeneratedCodePreview {...widgetProps} />}
        </div>
    )
}

/**
 * Demo UUID that works with the MSW mock handlers.
 * Using a valid UUID format to avoid validation errors.
 */
const DEMO_THERAPIST_UUID = '00000000-0000-0000-0000-000000000000'

const meta: Meta<typeof TebutoBookingWidget> = {
    title: 'Tebuto Booking Widget',
    component: TebutoBookingWidget,
    parameters: {
        layout: 'padded',
        backgrounds: {
            default: 'light gray',
            values: [
                { name: 'light gray', value: '#f3f4f6' },
                { name: 'white', value: '#ffffff' },
                { name: 'dark', value: '#1f2937' }
            ]
        },
        docs: {
            description: {
                component: `The Tebuto Booking Widget allows clients to book appointments directly.

This Storybook uses MSW (Mock Service Worker) to intercept API calls and provide mock data,
so you can see the real widget working without a backend connection.

## Configuration Options

- **therapistUUID**: Your unique therapist identifier (required)
- **border**: Show/hide widget border and shadow
- **backgroundColor**: Custom background color
- **categories**: Filter by category IDs
- **includeSubusers**: Include team member appointments
- **showQuickFilters**: Show time-of-day quick filters
- **theme**: Custom theming options`
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        therapistUUID: {
            control: 'text',
            description: 'UUID of the therapist (required)',
            table: { category: 'Required' }
        },
        backgroundColor: {
            control: 'color',
            description: 'Background color of the widget',
            table: { category: 'Appearance' }
        },
        border: {
            control: 'boolean',
            description: 'Show border and shadow around the widget',
            table: { category: 'Appearance' }
        },
        categories: {
            control: 'object',
            description: 'Filter appointments by category IDs',
            table: { category: 'Filtering' }
        },
        includeSubusers: {
            control: 'boolean',
            description: 'Include appointments from team members',
            table: { category: 'Filtering' }
        },
        showQuickFilters: {
            control: 'boolean',
            description: 'Show time-of-day quick filter buttons',
            table: { category: 'Features' }
        },
        inheritFont: {
            control: 'boolean',
            description: 'Use parent page font instead of widget font',
            table: { category: 'Appearance' }
        },
        theme: {
            control: 'object',
            description: 'Custom theme colors and fonts',
            table: { category: 'Theme' }
        }
    },
    render: args => <WidgetStoryPreview {...args} />
}

export default meta
type Story = StoryObj<typeof TebutoBookingWidget>

export const Default: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: true
    }
}

export const WithQuickFilters: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        showQuickFilters: true,
        border: true
    }
}

export const WithSubusers: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        includeSubusers: true,
        showQuickFilters: true,
        border: true
    }
}

export const NoBorder: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: false
    }
}

export const CustomBackgroundColor: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        backgroundColor: '#f0f9ff',
        border: true
    }
}

export const TebutoTheme: Story = {
    name: 'Theme: Tebuto (Default)',
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: true,
        theme: {
            primaryColor: '#00B4A9',
            backgroundColor: '#ffffff',
            textPrimary: '#374151',
            textSecondary: '#6b7280',
            borderColor: '#E9E9E9'
        }
    }
}

export const BlueTheme: Story = {
    name: 'Theme: Professional Blue',
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: true,
        theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            borderColor: '#e2e8f0'
        }
    }
}

export const OrangeTheme: Story = {
    name: 'Theme: Warm Orange',
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: true,
        theme: {
            primaryColor: '#f97316',
            backgroundColor: '#ffffff',
            textPrimary: '#1c1917',
            textSecondary: '#78716c',
            borderColor: '#fed7aa'
        }
    }
}

export const PurpleTheme: Story = {
    name: 'Theme: Elegant Purple',
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: true,
        theme: {
            primaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            textPrimary: '#1e1b4b',
            textSecondary: '#6b21a8',
            borderColor: '#e9d5ff'
        }
    }
}

export const DarkTheme: Story = {
    name: 'Theme: Dark Mode',
    parameters: {
        backgrounds: { default: 'dark' }
    },
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: true,
        theme: {
            primaryColor: '#00B4A9',
            backgroundColor: '#1f2937',
            textPrimary: '#f9fafb',
            textSecondary: '#9ca3af',
            borderColor: '#374151'
        }
    }
}

export const FullyConfigured: Story = {
    name: 'Fully Configured',
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        categories: [1, 2],
        border: true,
        includeSubusers: true,
        showQuickFilters: true,
        theme: {
            primaryColor: '#6366f1',
            backgroundColor: '#fafafa',
            textPrimary: '#18181b',
            textSecondary: '#71717a',
            borderColor: '#e4e4e7',
            fontFamily: '"Inter", system-ui, sans-serif'
        }
    }
}

export const CodeOnly: Story = {
    name: 'Embed Code Only',
    render: args => <GeneratedCodePreview {...args} />,
    args: {
        therapistUUID: 'YOUR-THERAPIST-UUID',
        border: true,
        theme: {
            primaryColor: '#00B4A9'
        }
    }
}
