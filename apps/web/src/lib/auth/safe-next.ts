/** Only allow same-site relative redirects after sign-in (blocks open redirects like //evil.com). */
export function safeNext(value: string | null | undefined, fallback = "/home"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/^\/(auth|sign-in)(\/|$|\?)/.test(value)) return fallback;
  return value;
}
