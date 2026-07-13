const keyFor = (registrationId: string) => `forep:workspace-registration:${registrationId}:token`;
export const REGISTRATION_SESSION_EVENT = "forep:registration-session-change";

function notifySessionChange(): void {
  window.dispatchEvent(new Event(REGISTRATION_SESSION_EVENT));
}

export function saveRegistrationToken(registrationId: string, token: string): void {
  if (typeof window === "undefined" || !registrationId || !token) return;
  window.sessionStorage.setItem(keyFor(registrationId), token);
  notifySessionChange();
}

export function getRegistrationToken(registrationId: string): string | null {
  if (typeof window === "undefined" || !registrationId) return null;
  return window.sessionStorage.getItem(keyFor(registrationId));
}

export function removeRegistrationToken(registrationId: string): void {
  if (typeof window === "undefined" || !registrationId) return;
  window.sessionStorage.removeItem(keyFor(registrationId));
  notifySessionChange();
}
