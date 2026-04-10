// Shared UID validator for client and server
export const UID_REGEX = /^[a-zA-Z0-9_-]{1,100}$/;

// Server-side type guard
export function isValidUidServer(uid: unknown): uid is string {
  return typeof uid === "string" && UID_REGEX.test(uid);
}

// Client-side boolean validator (accepts string)
export function isValidUidClient(uid: string): boolean {
  return UID_REGEX.test(uid);
}
