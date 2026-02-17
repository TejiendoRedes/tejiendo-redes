'use client';

import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useBreakpoint() {
    const [breakpoint, setBreakpoint] = React.useState<"mobile" | "tablet" | "desktop">("desktop")
    // Initial state to avoid hydration mismatch could be null or assume desktop then check

    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            if (width < MOBILE_BREAKPOINT) {
                setBreakpoint("mobile")
            } else if (width < TABLET_BREAKPOINT) {
                setBreakpoint("tablet")
            } else {
                setBreakpoint("desktop")
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return {
        isMobile: breakpoint === "mobile",
        isTablet: breakpoint === "tablet",
        isDesktop: breakpoint === "desktop",
        breakpoint
    }
}
