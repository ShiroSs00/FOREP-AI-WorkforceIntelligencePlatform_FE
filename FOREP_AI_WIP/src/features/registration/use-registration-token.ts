"use client";

import { useSyncExternalStore } from "react";
import { getRegistrationToken, REGISTRATION_SESSION_EVENT, removeRegistrationToken } from "@/lib/registration-session";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(REGISTRATION_SESSION_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(REGISTRATION_SESSION_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

const subscribeHydration = () => () => undefined;

export function useRegistrationToken(registrationId?: string) {
  const token = useSyncExternalStore(subscribe, () => registrationId ? getRegistrationToken(registrationId) : null, () => null);
  const ready = useSyncExternalStore(subscribeHydration, () => true, () => false);
  return {
    token,
    ready,
    clear: () => {
      if (registrationId) removeRegistrationToken(registrationId);
    },
  };
}
