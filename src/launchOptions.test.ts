import { test } from "node:test";
import assert from "node:assert/strict";
import { addCommand, removeCommand, hasCommand } from "./launchOptions.ts";

const LSFG = "~/lsfg %command%";

test("add into empty options", () => {
  assert.equal(addCommand("", LSFG), "~/lsfg %command%");
});

test("add chains into existing %command% wrapper", () => {
  assert.equal(
    addCommand("GAMEMODERUNEXEC=1 %command%", LSFG),
    "GAMEMODERUNEXEC=1 ~/lsfg %command%"
  );
});

test("add preserves plain game arguments", () => {
  assert.equal(addCommand("-fullscreen -novid", LSFG), "~/lsfg %command% -fullscreen -novid");
});

test("add is idempotent", () => {
  const once = addCommand("mangohud %command%", LSFG);
  assert.equal(addCommand(once, LSFG), once);
});

test("add plain-args command appends at the end", () => {
  assert.equal(addCommand("mangohud %command%", "-dx11"), "mangohud %command% -dx11");
});

test("remove restores empty field", () => {
  assert.equal(removeCommand("~/lsfg %command%", LSFG), "");
});

test("remove restores previous wrapper", () => {
  assert.equal(
    removeCommand("GAMEMODERUNEXEC=1 ~/lsfg %command%", LSFG),
    "GAMEMODERUNEXEC=1 %command%"
  );
});

test("remove keeps plain game arguments", () => {
  assert.equal(removeCommand("~/lsfg %command% -fullscreen", LSFG), "-fullscreen");
});

test("remove is a no-op when command absent", () => {
  assert.equal(removeCommand("mangohud %command%", LSFG), "mangohud %command%");
});

test("round trip add+remove returns the original", () => {
  for (const original of ["", "-w 1280 -h 800", "MANGOHUD=1 %command%", "gamescope -f -- %command%"]) {
    const added = addCommand(original, LSFG);
    assert.equal(removeCommand(added, LSFG), original.trim());
  }
});

test("hasCommand detects normalized matches", () => {
  assert.ok(hasCommand("FOO=1   ~/lsfg   %command%", LSFG));
  assert.ok(!hasCommand("FOO=1 %command%", LSFG));
});
