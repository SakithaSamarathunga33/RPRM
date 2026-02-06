'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
    /** Timeout duration in minutes */
    timeoutMinutes: number;
    /** Callback function when user becomes idle */
    onIdle: () => void;
    /** Whether the timeout is enabled */
    enabled?: boolean;
}

/**
 * Hook to detect user idle state and trigger logout after inactivity.
 * Monitors mouse movement, keyboard input, clicks, scrolls, and touch events.
 */
export function useIdleTimeout({ timeoutMinutes, onIdle, enabled = true }: UseIdleTimeoutOptions) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (enabled && timeoutMinutes > 0) {
            timeoutRef.current = setTimeout(() => {
                onIdle();
            }, timeoutMinutes * 60 * 1000);
        }
    }, [timeoutMinutes, onIdle, enabled]);

    useEffect(() => {
        if (!enabled || timeoutMinutes <= 0) {
            return;
        }

        // Events that indicate user activity
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'wheel',
        ];

        // Throttle the reset to avoid too many timer resets
        let throttleTimeout: NodeJS.Timeout | null = null;
        const throttledReset = () => {
            if (!throttleTimeout) {
                throttleTimeout = setTimeout(() => {
                    throttleTimeout = null;
                    resetTimer();
                }, 1000); // Throttle to once per second
            }
        };

        // Add event listeners
        activityEvents.forEach(event => {
            document.addEventListener(event, throttledReset, { passive: true });
        });

        // Also listen to visibility change - reset when user comes back to the tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Check if user was away longer than timeout
                const timeSinceLastActivity = Date.now() - lastActivityRef.current;
                if (timeSinceLastActivity >= timeoutMinutes * 60 * 1000) {
                    onIdle();
                } else {
                    resetTimer();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Start the initial timer
        resetTimer();

        // Cleanup
        return () => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, throttledReset);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (throttleTimeout) {
                clearTimeout(throttleTimeout);
            }
        };
    }, [enabled, timeoutMinutes, resetTimer, onIdle]);

    return {
        /** Manually reset the timer (useful when user performs an action) */
        resetTimer,
        /** Get time remaining until timeout in milliseconds */
        getTimeRemaining: () => {
            const elapsed = Date.now() - lastActivityRef.current;
            const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
            return Math.max(0, remaining);
        },
    };
}
