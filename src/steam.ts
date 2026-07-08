/**
 * Thin wrappers around the (undocumented) SteamClient / store globals that
 * the Steam Deck UI exposes to Decky plugins.
 */

declare const SteamClient: any;
declare const collectionStore: any;
declare const appDetailsStore: any;
declare const appStore: any;

const APP_TYPE_GAME = 1;
const APP_TYPE_SHORTCUT = 1073741824;

export interface AppEntry {
  appId: number;
  name: string;
  isShortcut: boolean;
  sortAs: string;
}

function isShortcutOverview(app: any): boolean {
  try {
    if (typeof app.BIsShortcut === "function") return app.BIsShortcut();
  } catch {
    // fall through to app_type check
  }
  return app.app_type === APP_TYPE_SHORTCUT;
}

/**
 * All apps the command can be injected into: Steam games plus non-Steam
 * shortcuts. Collected defensively from several collections because their
 * availability differs between SteamOS versions.
 */
export function getAllApps(): AppEntry[] {
  const seen = new Map<number, AppEntry>();

  const push = (app: any) => {
    if (!app || typeof app.appid !== "number" || seen.has(app.appid)) return;
    const isShortcut = isShortcutOverview(app);
    if (!isShortcut && app.app_type !== APP_TYPE_GAME) return;
    const name = app.display_name ?? `App ${app.appid}`;
    seen.set(app.appid, {
      appId: app.appid,
      name,
      isShortcut,
      sortAs: (app.sort_as ?? name).toString().toLowerCase(),
    });
  };

  const collections = [
    collectionStore?.allGamesCollection,
    collectionStore?.deckDesktopApps,
    collectionStore?.localGamesCollection,
  ];
  for (const collection of collections) {
    try {
      collection?.allApps?.forEach(push);
    } catch (e) {
      console.error("[launch-options] failed reading a collection", e);
    }
  }

  return [...seen.values()].sort((a, b) => a.sortAs.localeCompare(b.sortAs));
}

/**
 * Best-effort vertical capsule / grid artwork for an app, honoring custom
 * artwork the user set (works for non-Steam shortcuts too). Returns
 * undefined when nothing is available; callers should render a fallback.
 */
export function getAppImageUrl(appId: number): string | undefined {
  try {
    const overview = appStore?.GetAppOverviewByAppID?.(appId);
    if (!overview) return undefined;
    const custom = appStore.GetCustomVerticalCapsuleURLs?.(overview);
    if (Array.isArray(custom) && custom.length > 0) return custom[custom.length - 1];
    return (
      appStore.GetVerticalCapsuleURLForApp?.(overview) ??
      appStore.GetLandscapeImageURLForApp?.(overview) ??
      appStore.GetIconURLForApp?.(overview)
    );
  } catch (e) {
    console.error("[launch-options] failed to resolve artwork for", appId, e);
    return undefined;
  }
}

function extractLaunchOptions(details: any): string {
  return details?.strLaunchOptions ?? details?.strShortcutLaunchOptions ?? "";
}

/**
 * Reads the current launch options of an app. Uses RegisterForAppDetails so
 * Steam actually fetches fresh data, with a cached-store fallback on timeout.
 */
export function getLaunchOptions(appId: number): Promise<string> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    let registration: any;
    try {
      registration = SteamClient.Apps.RegisterForAppDetails(appId, (details: any) => {
        try {
          registration?.unregister();
        } catch {
          // ignore double-unregister
        }
        finish(extractLaunchOptions(details));
      });
    } catch (e) {
      console.error("[launch-options] RegisterForAppDetails failed", e);
    }

    setTimeout(() => {
      try {
        registration?.unregister();
      } catch {
        // ignore
      }
      finish(extractLaunchOptions(appDetailsStore?.GetAppDetails?.(appId)));
    }, 4000);
  });
}

/** Writes launch options, using the shortcut-specific API when available. */
export function setLaunchOptions(app: AppEntry, options: string): void {
  if (app.isShortcut && typeof SteamClient.Apps.SetShortcutLaunchOptions === "function") {
    SteamClient.Apps.SetShortcutLaunchOptions(app.appId, options);
  } else {
    SteamClient.Apps.SetAppLaunchOptions(app.appId, options);
  }
}
