import * as React from "react"

const MOBILE_BREAKPOINT = 768

const getMobileSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT
const getMobileServerSnapshot = () => false

const subscribeToMobileChanges = (onStoreChange: () => void) => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToMobileChanges,
    getMobileSnapshot,
    getMobileServerSnapshot
  )
}
