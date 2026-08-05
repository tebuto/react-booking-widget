import type { Meta, StoryObj } from '@storybook/react'
import { TEBUTO_SEMINARS_WIDGET_SCRIPT_URL } from '../constants'
import { TebutoSeminarsWidgetConfiguration } from '../types'
import TebutoSeminarsWidget from './TebutoSeminarsWidget'

function pushThemeAttrs(attrs: string[], theme: NonNullable<TebutoSeminarsWidgetConfiguration['theme']>): void {
    if (theme.primaryColor) attrs.push(`data-primary-color="${theme.primaryColor}"`)
    if (theme.textPrimary) attrs.push(`data-text-primary="${theme.textPrimary}"`)
    if (theme.textSecondary) attrs.push(`data-text-secondary="${theme.textSecondary}"`)
    if (theme.borderColor) attrs.push(`data-border-color="${theme.borderColor}"`)
    if (theme.fontFamily) attrs.push(`data-font-family="${theme.fontFamily}"`)
}

function buildHtmlDataAttributes(config: TebutoSeminarsWidgetConfiguration): string[] {
    const attrs: string[] = [`data-therapist-uuid="${config.therapistUUID}"`]

    const backgroundColor = config.backgroundColor ?? config.theme?.backgroundColor
    if (backgroundColor) attrs.push(`data-background-color="${backgroundColor}"`)
    if (config.seminarSlugs && config.seminarSlugs.length > 0) {
        attrs.push(`data-seminars="${config.seminarSlugs.join(',')}"`)
    }
    if (config.border !== undefined) attrs.push(`data-border="${config.border}"`)
    if (config.showListFirst !== undefined) attrs.push(`data-show-list-first="${config.showListFirst}"`)

    const inheritFont = config.inheritFont ?? config.theme?.inheritFont
    if (inheritFont !== undefined) attrs.push(`data-inherit-font="${inheritFont}"`)

    if (config.theme) pushThemeAttrs(attrs, config.theme)

    return attrs
}

function GeneratedCodePreview(props: Readonly<TebutoSeminarsWidgetConfiguration>) {
    const attrs = buildHtmlDataAttributes(props)
    const code = `<div id="tebuto-seminars-widget"></div>
<script
  src="${TEBUTO_SEMINARS_WIDGET_SCRIPT_URL}"
  ${attrs.join('\n  ')}
></script>`

    return (
        <div style={{ marginTop: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151', fontWeight: 600 }}>Embed Code</h4>
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

function WidgetStoryPreview(props: TebutoSeminarsWidgetConfiguration & { showCode?: boolean }) {
    const { showCode = true, ...widgetProps } = props

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '960px' }}>
            <TebutoSeminarsWidget {...widgetProps} />
            {showCode && <GeneratedCodePreview {...widgetProps} />}
        </div>
    )
}

const DEMO_THERAPIST_UUID = '00000000-0000-0000-0000-000000000000'

const meta: Meta<typeof TebutoSeminarsWidget> = {
    title: 'Tebuto Seminars Widget',
    component: TebutoSeminarsWidget,
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
                component: `The Tebuto Seminars Widget embeds seminar listing and registration.

It injects the hosted \`seminars.js\` script with \`data-*\` attributes — the same contract as the HTML snippet and WordPress shortcode.`
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
            description: 'Show border around the widget',
            table: { category: 'Appearance' }
        },
        seminarSlugs: {
            control: 'object',
            description: 'Filter to these seminar slugs',
            table: { category: 'Filtering' }
        },
        showListFirst: {
            control: 'boolean',
            description: 'Show seminar list first (false skips list when one seminar)',
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
type Story = StoryObj<typeof TebutoSeminarsWidget>

export const Default: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: true
    }
}

export const SingleSeminarSkipList: Story = {
    name: 'Single seminar (skip list)',
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        seminarSlugs: ['einfuehrungsseminar'],
        showListFirst: false,
        border: true
    }
}

export const SeminarSelection: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        seminarSlugs: ['yoga', 'meditation'],
        border: true
    }
}

export const NoBorder: Story = {
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        border: false
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

export const FullyConfigured: Story = {
    name: 'Fully Configured',
    args: {
        therapistUUID: DEMO_THERAPIST_UUID,
        seminarSlugs: ['yoga'],
        showListFirst: false,
        inheritFont: true,
        border: true,
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
        seminarSlugs: ['mein-seminar'],
        theme: {
            primaryColor: '#00B4A9'
        }
    }
}
