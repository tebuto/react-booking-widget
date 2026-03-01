import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'

const TEBUTO_API_BASE_URL = 'https://api.tebuto.de'
const FINGERPRINT_STORAGE_KEY = 'tebuto-fingerprint'

type TebutoConfig = {
    therapistUUID: string
    apiBaseUrl: string
    categories?: number[]
    includeSubusers?: boolean
}

type TebutoContextValue = TebutoConfig & {
    buildUrl: (path: string) => string
    fingerprint: string
}

const TebutoContext = createContext<TebutoContextValue | null>(null)

type TebutoProviderProps = {
    therapistUUID: string
    apiBaseUrl?: string
    categories?: number[]
    includeSubusers?: boolean
    children: ReactNode
}

function useFingerprint(): string {
    const [fingerprint, setFingerprint] = useState<string>('')

    useEffect(() => {
        if (typeof window === 'undefined') return

        const stored = sessionStorage.getItem(FINGERPRINT_STORAGE_KEY)
        if (stored) {
            setFingerprint(stored)
        } else {
            const newFingerprint = crypto.randomUUID()
            sessionStorage.setItem(FINGERPRINT_STORAGE_KEY, newFingerprint)
            setFingerprint(newFingerprint)
        }
    }, [])

    return fingerprint
}

/**
 * TebutoProvider - Context provider for Tebuto booking hooks
 *
 * Wrap your booking components with this provider to share configuration
 * across all Tebuto hooks.
 *
 * @example
 * ```tsx
 * <TebutoProvider therapistUUID="your-uuid">
 *   <YourBookingComponent />
 * </TebutoProvider>
 * ```
 */
export function TebutoProvider({ therapistUUID, apiBaseUrl = TEBUTO_API_BASE_URL, categories, includeSubusers, children }: TebutoProviderProps) {
    const fingerprint = useFingerprint()

    const value = useMemo<TebutoContextValue>(
        () => ({
            therapistUUID,
            apiBaseUrl,
            categories,
            includeSubusers,
            buildUrl: (path: string) => `${apiBaseUrl}${path}`,
            fingerprint
        }),
        [therapistUUID, apiBaseUrl, categories, includeSubusers, fingerprint]
    )

    return <TebutoContext.Provider value={value}>{children}</TebutoContext.Provider>
}

/**
 * useTebutoContext - Access the Tebuto configuration context
 *
 * Must be used within a TebutoProvider.
 *
 * @throws Error if used outside of TebutoProvider
 */
export function useTebutoContext(): TebutoContextValue {
    const context = useContext(TebutoContext)

    if (!context) {
        throw new Error('useTebutoContext must be used within a TebutoProvider')
    }

    return context
}
