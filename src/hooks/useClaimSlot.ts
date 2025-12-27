import { useCallback, useRef, useState } from 'react'
import type { ClaimResponse, TimeSlot } from '../api-types'
import { useTebutoContext } from './TebutoProvider'

type ClaimState = {
    claimedSlot: TimeSlot | null
    claimResponse: ClaimResponse | null
    isLoading: boolean
    error: Error | null
}

type UseClaimSlotReturn = ClaimState & {
    /** Claim a time slot to reserve it temporarily */
    claim: (slot: TimeSlot) => Promise<ClaimResponse | null>
    /** Release the currently claimed slot */
    unclaim: () => Promise<void>
    /** Check if a specific slot is currently claimed */
    isClaimed: (slot: TimeSlot) => boolean
    /** Clear error state */
    clearError: () => void
}

/**
 * useClaimSlot - Temporarily claim a time slot
 *
 * Claims a time slot to reserve it while the user fills out
 * their booking information. Automatically handles unclaiming
 * when claiming a new slot.
 *
 * @example
 * ```tsx
 * const { claim, unclaim, claimedSlot, claimResponse, isLoading } = useClaimSlot()
 *
 * const handleSlotSelect = async (slot: TimeSlot) => {
 *   const response = await claim(slot)
 *   if (response?.isAvailable) {
 *     setStep('booking-form')
 *   }
 * }
 *
 * const handleCancel = () => {
 *   unclaim()
 *   setStep('slot-selection')
 * }
 * ```
 */
export function useClaimSlot(): UseClaimSlotReturn {
    const { therapistUUID, buildUrl } = useTebutoContext()
    const [state, setState] = useState<ClaimState>({
        claimedSlot: null,
        claimResponse: null,
        isLoading: false,
        error: null
    })

    const claimKeyRef = useRef<string | null>(null)

    const unclaim = useCallback(async () => {
        if (!state.claimedSlot || !claimKeyRef.current) {
            setState(prev => ({ ...prev, claimedSlot: null, claimResponse: null }))
            return
        }

        try {
            await fetch(buildUrl(`/events/${therapistUUID}/unclaim`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: state.claimedSlot.start,
                    eventRuleId: state.claimedSlot.eventRuleId
                })
            })
        } catch {
            // Silently fail unclaim - slot will auto-release eventually
        } finally {
            claimKeyRef.current = null
            setState(prev => ({ ...prev, claimedSlot: null, claimResponse: null }))
        }
    }, [state.claimedSlot, therapistUUID, buildUrl])

    const claim = useCallback(
        async (slot: TimeSlot): Promise<ClaimResponse | null> => {
            // If already claiming the same slot, return existing response
            const newKey = `${slot.start}-${slot.eventRuleId}`
            if (claimKeyRef.current === newKey && state.claimResponse) {
                return state.claimResponse
            }

            // Unclaim previous slot if any
            if (claimKeyRef.current && claimKeyRef.current !== newKey) {
                await unclaim()
            }

            setState(prev => ({
                ...prev,
                isLoading: true,
                error: null
            }))

            try {
                const response = await fetch(buildUrl(`/events/${therapistUUID}/claim`), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        start: slot.start,
                        end: slot.end,
                        eventRuleId: slot.eventRuleId
                    })
                })

                if (!response.ok) {
                    throw new Error(`Failed to claim slot: ${response.statusText}`)
                }

                const claimResponse = (await response.json()) as ClaimResponse

                if (!claimResponse.isAvailable) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: new Error('This time slot is no longer available')
                    }))
                    return null
                }

                claimKeyRef.current = newKey
                setState({
                    claimedSlot: slot,
                    claimResponse,
                    isLoading: false,
                    error: null
                })

                return claimResponse
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error occurred')
                setState(prev => ({ ...prev, isLoading: false, error }))
                return null
            }
        },
        [therapistUUID, buildUrl, unclaim, state.claimResponse]
    )

    const isClaimed = useCallback(
        (slot: TimeSlot): boolean => {
            if (!state.claimedSlot) return false
            return state.claimedSlot.start === slot.start && state.claimedSlot.eventRuleId === slot.eventRuleId
        },
        [state.claimedSlot]
    )

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }))
    }, [])

    return {
        ...state,
        claim,
        unclaim,
        isClaimed,
        clearError
    }
}
