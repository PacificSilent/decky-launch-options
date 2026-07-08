/**
 * Pure string logic for injecting/removing a command inside Steam launch
 * options while preserving whatever the user already had configured.
 *
 * Steam semantics for the launch options field:
 *  - If the field contains `%command%`, Steam substitutes the real game
 *    command there (so the field acts as a wrapper, e.g. `mangohud %command%`).
 *  - If it does NOT contain `%command%`, the whole field is appended to the
 *    game command as plain arguments.
 */

const WS = /\s+/g;

export function normalize(options: string): string {
  return options.replace(WS, " ").trim();
}

/** True when `existing` already contains the injected command. */
export function hasCommand(existing: string, command: string): boolean {
  const cmd = normalize(command);
  if (!cmd) return false;
  return normalize(existing).includes(cmd);
}

/**
 * Injects `command` into `existing` launch options.
 *
 * The injection is done so the new wrapper runs *closest to the game*
 * (i.e. it is added "last", after anything the user already configured):
 *  - empty existing            -> `command`
 *  - existing has `%command%`  -> that `%command%` is replaced by `command`
 *    (e.g. `GAMEMODE=1 %command%` + `~/lsfg %command%`
 *          -> `GAMEMODE=1 ~/lsfg %command%`)
 *  - existing has no `%command%` (plain game args) -> `command existing`
 *    so the args keep being passed to the game
 *    (e.g. `-fullscreen` + `~/lsfg %command%` -> `~/lsfg %command% -fullscreen`)
 */
export function addCommand(existing: string, command: string): string {
  const cmd = normalize(command);
  const cur = normalize(existing);
  if (!cmd) return cur;
  if (!cur) return cmd;
  if (hasCommand(cur, cmd)) return cur;

  if (cmd.includes("%command%")) {
    if (cur.includes("%command%")) {
      return normalize(cur.replace("%command%", cmd));
    }
    // Existing content is plain arguments for the game: keep them after
    // %command% so they still reach the game binary.
    return normalize(`${cmd} ${cur}`);
  }

  // Our command is plain arguments: just append at the end.
  return normalize(`${cur} ${cmd}`);
}

/**
 * Removes a previously injected `command` from `existing`, restoring the
 * remaining options. Inverse of {@link addCommand}.
 */
export function removeCommand(existing: string, command: string): string {
  const cmd = normalize(command);
  let cur = normalize(existing);
  if (!cmd || !cur.includes(cmd)) return cur;

  // Put a bare %command% back where a wrapper command was, so surrounding
  // wrappers/env vars keep working; plain-args commands just disappear.
  cur = normalize(cur.replace(cmd, cmd.includes("%command%") ? "%command%" : " "));

  // A lone or leading %command% left behind by the removal is redundant:
  // plain arguments after it behave the same without it. This also covers
  // removing a wrapper like `~/lsfg` whose `%command%` would otherwise be
  // orphaned in the field.
  while (cur.startsWith("%command% ")) cur = normalize(cur.slice("%command% ".length));
  if (cur === "%command%") return "";
  return cur;
}
