import {
  ButtonItem,
  Focusable,
  ModalRoot,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
  showModal,
  staticClasses,
} from "@decky/ui";
import { definePlugin, toaster } from "@decky/api";
import { useEffect, useMemo, useState } from "react";
import { FaTerminal } from "react-icons/fa";

import { addCommand, hasCommand, normalize, removeCommand } from "./launchOptions";
import {
  AppEntry,
  getAllApps,
  getAppImageUrl,
  getLaunchOptions,
  setLaunchOptions,
} from "./steam";
import { Lang, Strings, TRANSLATIONS, loadLang, saveLang } from "./i18n";

const STORAGE_KEY = "decky-launch-options:command";
const DEFAULT_COMMAND = "~/lsfg %command%";
const MAX_VISIBLE_CARDS = 30;

function loadSavedCommand(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_COMMAND;
  } catch {
    return DEFAULT_COMMAND;
  }
}

function saveCommand(command: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, command);
  } catch {
    // localStorage unavailable: keep the value in memory only
  }
}

function AppCard({ app, command, t }: { app: AppEntry; command: string; t: Strings }) {
  const [options, setOptions] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setOptions(null);
    getLaunchOptions(app.appId).then((current) => {
      if (alive) setOptions(current);
    });
    return () => {
      alive = false;
    };
  }, [app.appId]);

  const imageUrl = useMemo(() => getAppImageUrl(app.appId), [app.appId]);
  const loaded = options !== null;
  const enabled = loaded && hasCommand(options!, command);

  const toggle = async () => {
    if (busy || !loaded || normalize(command) === "") return;
    setBusy(true);
    try {
      // Re-read right before writing to avoid clobbering concurrent edits.
      const current = await getLaunchOptions(app.appId);
      const adding = !hasCommand(current, command);
      const next = adding ? addCommand(current, command) : removeCommand(current, command);
      setLaunchOptions(app, next);
      setOptions(next);
      toaster.toast({
        title: app.name,
        body: adding ? t.toastAdded(normalize(command)) : t.toastRemoved,
      });
    } catch (e) {
      console.error("[launch-options] failed to update", app.appId, e);
      toaster.toast({ title: app.name, body: t.toastError });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Focusable
      onActivate={toggle}
      onOKActionDescription={enabled ? t.cardRemove : t.cardAdd}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#23262e",
        outline: "none",
        border: enabled ? "2px solid #59bf40" : "2px solid transparent",
        boxShadow: focused ? "0 0 0 2px #fff" : "none",
        transform: focused ? "scale(1.04)" : "scale(1)",
        transition: "transform .1s ease, box-shadow .1s ease",
        opacity: busy ? 0.6 : 1,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "2 / 3",
          background: "#16181d",
        }}
      >
        {imageUrl && !imgFailed ? (
          <img
            src={imageUrl}
            onError={() => setImgFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
              opacity: 0.4,
            }}
          >
            {app.name.charAt(0).toUpperCase()}
          </div>
        )}
        {enabled && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#59bf40",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            ✓
          </div>
        )}
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,.45)",
              fontSize: "11px",
            }}
          >
            {t.loading}
          </div>
        )}
      </div>
      <div
        style={{
          padding: "5px 7px",
          fontSize: "11px",
          lineHeight: 1.25,
          height: "2.6em",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {app.name}
      </div>
      <div style={{ padding: "0 7px 5px", fontSize: "9px", opacity: 0.55 }}>
        {app.isShortcut ? t.nonSteamApp : t.steamApp}
      </div>
    </Focusable>
  );
}

function AppPickerModal({
  closeModal,
  command,
  t,
}: {
  closeModal?: () => void;
  command: string;
  t: Strings;
}) {
  const [search, setSearch] = useState("");
  const apps = useMemo(getAllApps, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return apps;
    return apps.filter((app) => app.name.toLowerCase().includes(needle));
  }, [apps, search]);

  const visible = filtered.slice(0, MAX_VISIBLE_CARDS);
  const hidden = filtered.length - visible.length;

  return (
    <ModalRoot closeModal={closeModal}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div className={staticClasses.Title} style={{ padding: 0 }}>
          {t.pickerTitle}
        </div>
        <div style={{ fontSize: "12px", opacity: 0.7 }}>
          {t.pickerHint} · <code>{normalize(command)}</code>
        </div>
        <TextField
          label={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {apps.length === 0 && <div style={{ opacity: 0.7 }}>{t.noApps}</div>}
        <Focusable
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(105px, 1fr))",
            gap: "8px",
            maxHeight: "52vh",
            overflowY: "auto",
            padding: "4px",
          }}
        >
          {visible.map((app) => (
            <AppCard key={app.appId} app={app} command={command} t={t} />
          ))}
        </Focusable>
        {hidden > 0 && (
          <div style={{ fontSize: "12px", opacity: 0.7, textAlign: "center" }}>
            {t.moreResults(hidden)}
          </div>
        )}
      </div>
    </ModalRoot>
  );
}

function Content() {
  const [command, setCommand] = useState<string>(loadSavedCommand);
  const [lang, setLang] = useState<Lang>(loadLang);
  const t = TRANSLATIONS[lang];

  return (
    <>
      <PanelSection title={t.commandSection}>
        <PanelSectionRow>
          <TextField
            label={t.commandLabel}
            description={t.commandDescription}
            value={command}
            onChange={(e) => {
              setCommand(e.target.value);
              saveCommand(e.target.value);
            }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              setCommand(DEFAULT_COMMAND);
              saveCommand(DEFAULT_COMMAND);
            }}
          >
            {t.resetDefault}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t.appsSection}>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => showModal(<AppPickerModal command={command} t={t} />)}
          >
            {t.openPicker}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t.settingsSection}>
        <PanelSectionRow>
          <ToggleField
            label={t.languageToggle}
            description={t.languageDescription}
            checked={lang === "es"}
            onChange={(value) => {
              const next: Lang = value ? "es" : "en";
              setLang(next);
              saveLang(next);
            }}
          />
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}

export default definePlugin(() => ({
  name: "Launch Options Injector",
  titleView: <div className={staticClasses.Title}>Launch Options</div>,
  content: <Content />,
  icon: <FaTerminal />,
}));
