import { beforeAll, expect, test, vi } from "vite-plus/test";

let session: typeof import("@/lib/session");

beforeAll(async () => {
  vi.stubEnv("APP_PASSWORD", "correct-horse");
  vi.stubEnv("SESSION_SECRET", "test-secret-that-is-at-least-32-characters");
  session = await import("@/lib/session");
});

test("accepts the right password and rejects others", () => {
  expect(session.checkPassword("correct-horse")).toBe(true);
  expect(session.checkPassword("wrong")).toBe(false);
  expect(session.checkPassword("")).toBe(false);
});

test("accepts a fresh token", () => {
  expect(session.isValidSessionToken(session.createSessionToken())).toBe(true);
});

test("rejects an expired token", () => {
  const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
  expect(session.isValidSessionToken(session.createSessionToken(eightDaysAgo))).toBe(false);
});

test("rejects missing, malformed or tampered tokens", () => {
  const token = session.createSessionToken();
  expect(session.isValidSessionToken(undefined)).toBe(false);
  expect(session.isValidSessionToken("not-a-token")).toBe(false);
  expect(session.isValidSessionToken(`${token}x`)).toBe(false);
  expect(session.isValidSessionToken(`${token}.extra`)).toBe(false);
});

test("rejects a token with a changed expiry", () => {
  const [, signature] = session.createSessionToken().split(".");
  const farFuture = Date.now() + 365 * 24 * 60 * 60 * 1000;
  expect(session.isValidSessionToken(`${farFuture}.${signature}`)).toBe(false);
});

test("logs everyone out when the password changes", () => {
  const token = session.createSessionToken();
  vi.stubEnv("APP_PASSWORD", "a-new-password");
  expect(session.isValidSessionToken(token)).toBe(false);
  vi.stubEnv("APP_PASSWORD", "correct-horse");
});
