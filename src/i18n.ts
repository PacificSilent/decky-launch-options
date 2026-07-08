export type Lang = "en" | "es";

export interface Strings {
  commandSection: string;
  commandLabel: string;
  commandDescription: string;
  resetDefault: string;
  appsSection: string;
  openPicker: string;
  settingsSection: string;
  languageLabel: string;
  pickerTitle: string;
  pickerHint: string;
  searchPlaceholder: string;
  loading: string;
  noApps: string;
  cardAdd: string;
  cardRemove: string;
  toastAdded: (cmd: string) => string;
  toastRemoved: string;
  toastError: string;
  steamApp: string;
  nonSteamApp: string;
  close: string;
}

const en: Strings = {
  commandSection: "Command to inject",
  commandLabel: "Command",
  commandDescription:
    "Appended to the end of existing launch options. Use %command% to wrap the game.",
  resetDefault: "Reset to default (~/lsfg %command%)",
  appsSection: "Applications",
  openPicker: "Select games...",
  settingsSection: "Settings",
  languageLabel: "Language",
  pickerTitle: "Select games",
  pickerHint: "Press A on a card to add or remove the command",
  searchPlaceholder: "Search...",
  loading: "Loading...",
  noApps: "No installed applications found.",
  cardAdd: "Add command",
  cardRemove: "Remove command",
  toastAdded: (cmd) => `Added: ${cmd}`,
  toastRemoved: "Command removed",
  toastError: "Failed to update launch options",
  steamApp: "Steam",
  nonSteamApp: "Non-Steam",
  close: "Close",
};

const es: Strings = {
  commandSection: "Comando a inyectar",
  commandLabel: "Comando",
  commandDescription:
    "Se añade al final de las opciones de lanzamiento existentes. Usa %command% para envolver el juego.",
  resetDefault: "Restaurar por defecto (~/lsfg %command%)",
  appsSection: "Aplicaciones",
  openPicker: "Seleccionar juegos...",
  settingsSection: "Ajustes",
  languageLabel: "Idioma",
  pickerTitle: "Seleccionar juegos",
  pickerHint: "Pulsa A sobre una card para añadir o quitar el comando",
  searchPlaceholder: "Buscar...",
  loading: "Cargando...",
  noApps: "No se encontraron aplicaciones instaladas.",
  cardAdd: "Añadir comando",
  cardRemove: "Quitar comando",
  toastAdded: (cmd) => `Añadido: ${cmd}`,
  toastRemoved: "Comando eliminado",
  toastError: "Error al actualizar las opciones",
  steamApp: "Steam",
  nonSteamApp: "Non-Steam",
  close: "Cerrar",
};

export const TRANSLATIONS: Record<Lang, Strings> = { en, es };

const LANG_KEY = "decky-launch-options:lang";

export function loadLang(): Lang {
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    return saved === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

export function saveLang(lang: Lang): void {
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // localStorage unavailable: keep the value in memory only
  }
}
