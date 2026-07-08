import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
  staticClasses,
} from "@decky/ui";
import { definePlugin, toaster } from "@decky/api";
import { useEffect, useMemo, useState } from "react";
import { FaTerminal } from "react-icons/fa";

import { addCommand, hasCommand, normalize, removeCommand } from "./launchOptions";
import { AppEntry, getAllApps, getLaunchOptions, setLaunchOptions } from "./steam";

const STORAGE_KEY = "decky-launch-options:command";
const DEFAULT_COMMAND = "~/lsfg %command%";
const MAX_VISIBLE_APPS = 25;

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

function AppRow({ app, command }: { app: AppEntry; command: string }) {
  const [options, setOptions] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const loaded = options !== null;
  const enabled = loaded && hasCommand(options!, command);

  const description = !loaded
    ? "Leyendo opciones actuales..."
    : normalize(options!) === ""
      ? app.isShortcut
        ? "Non-Steam · sin opciones"
        : "Steam · sin opciones"
      : `${app.isShortcut ? "Non-Steam" : "Steam"} · ${normalize(options!)}`;

  const onToggle = async (value: boolean) => {
    if (busy || !loaded) return;
    setBusy(true);
    try {
      // Re-read right before writing to avoid clobbering concurrent edits.
      const current = await getLaunchOptions(app.appId);
      const next = value ? addCommand(current, command) : removeCommand(current, command);
      setLaunchOptions(app, next);
      setOptions(next);
      toaster.toast({
        title: app.name,
        body: value ? `Añadido: ${normalize(command)}` : "Comando eliminado",
      });
    } catch (e) {
      console.error("[launch-options] failed to update", app.appId, e);
      toaster.toast({ title: app.name, body: "Error al actualizar las opciones" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PanelSectionRow>
      <ToggleField
        label={app.name}
        description={description}
        checked={enabled}
        disabled={!loaded || busy || normalize(command) === ""}
        onChange={onToggle}
      />
    </PanelSectionRow>
  );
}

function Content() {
  const [command, setCommand] = useState<string>(loadSavedCommand);
  const [search, setSearch] = useState("");
  const [apps, setApps] = useState<AppEntry[]>([]);

  const refreshApps = () => setApps(getAllApps());

  useEffect(() => {
    refreshApps();
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return apps;
    return apps.filter((app) => app.name.toLowerCase().includes(needle));
  }, [apps, search]);

  const visible = filtered.slice(0, MAX_VISIBLE_APPS);
  const hidden = filtered.length - visible.length;

  return (
    <>
      <PanelSection title="Comando a inyectar">
        <PanelSectionRow>
          <TextField
            label="Comando"
            description="Se añade al final de las opciones de lanzamiento existentes. Usa %command% para envolver el juego."
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
            Restaurar por defecto (~/lsfg %command%)
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Aplicaciones">
        <PanelSectionRow>
          <TextField
            label="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={refreshApps}>
            Recargar lista
          </ButtonItem>
        </PanelSectionRow>

        {apps.length === 0 && (
          <PanelSectionRow>
            <div>No se encontraron aplicaciones. Prueba "Recargar lista".</div>
          </PanelSectionRow>
        )}

        {visible.map((app) => (
          <AppRow key={app.appId} app={app} command={command} />
        ))}

        {hidden > 0 && (
          <PanelSectionRow>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              {hidden} aplicaciones más. Usa el buscador para encontrarlas.
            </div>
          </PanelSectionRow>
        )}
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
