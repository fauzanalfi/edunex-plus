// @vitest-environment jsdom
// Phase A: a lecturer signed in opens the lecturer shell (not the "bukan mahasiswa" banner).
import { afterEach, expect, it } from "vitest";
import { PretendWorld } from "../pretend/world";
import { openApp } from "./harness";

let screen: Awaited<ReturnType<typeof openApp>> | null = null;
afterEach(() => {
  screen?.close();
  screen = null;
});

it("a lecturer's Edunex opens the lecturer shell, with a way to Edunex and to sign out", async () => {
  const world = new PretendWorld();
  const { code: _nim, ...me } = world.edunex.me as Record<string, unknown>;
  world.edunex.me = { ...me, level: "LECTURER" };
  screen = await openApp({ world, signedIn: true });

  expect(screen.text()).toContain("Siap sebagai dosen");
  expect(screen.text()).toContain("Dosen");
  expect(screen.text()).not.toContain("bukan akun mahasiswa");
  expect(screen.text()).not.toContain("Edunex berubah");
  expect(screen.has("Laporkan")).toBe(false);

  await screen.click("Keluar");
  expect(screen.calls.find((call) => call.name === "auth.signOut")).toEqual({ name: "auth.signOut", input: {} });
});
