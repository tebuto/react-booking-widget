import { useCallback, useEffect, useState } from 'react'
import type { AsyncState, Therapist } from '../api-types'
import { useTebutoContext } from './TebutoProvider'

type UseTherapistReturn = AsyncState<Therapist> & {
    refetch: () => Promise<void>
}

/**
 * useTherapist - Fetch therapist information
 *
 * Automatically fetches the therapist data when the component mounts.
 * Uses the therapistUUID from the TebutoProvider context.
 *
 * @example
 * ```tsx
 * const { data: therapist, isLoading, error } = useTherapist()
 *
 * if (isLoading) return <Spinner />
 * if (error) return <Error message={error.message} />
 *
 * return <h1>Book with {therapist.name}</h1>
 * ```
 */
export function useTherapist(): UseTherapistReturn {
    const { therapistUUID, buildUrl } = useTebutoContext()
    const [state, setState] = useState<AsyncState<Therapist>>({
        data: null,
        isLoading: true,
        error: null
    })

    const fetchTherapist = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const response = await fetch(buildUrl(`/therapists/uuid/${therapistUUID}`))

            if (!response.ok) {
                throw new Error(`Failed to fetch therapist: ${response.statusText}`)
            }

            const data = (await response.json()) as Therapist
            setState({ data, isLoading: false, error: null })
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error occurred')
            setState({ data: null, isLoading: false, error })
        }
    }, [therapistUUID, buildUrl])

    useEffect(() => {
        void fetchTherapist()
    }, [fetchTherapist])

    return {
        ...state,
        refetch: fetchTherapist
    }
}
