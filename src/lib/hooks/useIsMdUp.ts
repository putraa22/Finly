import { useSyncExternalStore } from "react";

const MD_QUERY = "(min-width: 768px)";

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(MD_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(MD_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** True when viewport is Tailwind `md` (≥768px) — desktop / tablet landscape. */
export function useIsMdUp() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
