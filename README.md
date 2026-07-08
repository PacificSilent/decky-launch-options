# Decky Launch Options Injector

[![Release](https://img.shields.io/github/v/release/PacificSilent/decky-launch-options)](https://github.com/PacificSilent/decky-launch-options/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build](https://github.com/PacificSilent/decky-launch-options/actions/workflows/build.yml/badge.svg)](https://github.com/PacificSilent/decky-launch-options/actions)

Plugin de [Decky Loader](https://decky.xyz/) para Steam Deck que permite inyectar un comando
(por defecto `~/lsfg %command%`, el wrapper de [decky-lsfg-vk](https://github.com/xXJSONDeruloXx/decky-lsfg-vk))
en las **Configuraciones de Lanzamiento** de cualquier juego, tanto de Steam como non-Steam,
sin pisar lo que el usuario ya tenía configurado.

## Capturas

| Panel en el Quick Access Menu | Selector de juegos |
| --- | --- |
| ![Panel del plugin en el menú de acceso rápido](docs/qam-panel.png) | ![Modal selector con cards de los juegos instalados](docs/game-picker.png) |

El comando queda inyectado en las propiedades del juego, como si lo hubieras escrito a mano:

![Opciones de lanzamiento resultantes en las propiedades del juego](docs/launch-options-result.png)

## Características

- ✅ Funciona con juegos de **Steam** y accesos directos **non-Steam** (usa `SetShortcutLaunchOptions` cuando corresponde).
- ✅ El comando se **inyecta preservando** las opciones existentes:
  - Campo vacío → `~/lsfg %command%`
  - `GAMEMODE=1 %command%` → `GAMEMODE=1 ~/lsfg %command%` (el wrapper queda pegado al juego)
  - `-fullscreen` (argumentos sueltos) → `~/lsfg %command% -fullscreen`
- ✅ Quitar el comando **restaura** las opciones anteriores.
- ✅ Quitar el comando limpia también un `%command%` que quedaría huérfano.
- ✅ Comando editable y persistente (por si quieres inyectar otra cosa: `mangohud %command%`, etc.).
- ✅ Selector visual en un modal: cards con la portada del juego, buscador y toggle con el botón A.
- ✅ Interfaz en inglés (por defecto) o español, con toggle en Ajustes.

## Uso

1. Abre el menú de acceso rápido (botón `...`) y entra al plugin **Launch Options**.
2. Ajusta el comando si hace falta (por defecto `~/lsfg %command%`).
3. Pulsa **Select games...** para abrir el selector: busca el juego y pulsa A sobre su card
   para añadir el comando a sus opciones de lanzamiento. Púlsala de nuevo para quitarlo y
   recuperar las opciones anteriores.

## Instalación

### Desde el Release (recomendado)

1. En Decky Loader: engranaje ⚙️ → activa *Developer mode*.
2. En la pestaña *Developer* → *Install plugin from URL* pega:

   ```
   https://github.com/PacificSilent/decky-launch-options/releases/latest/download/decky-launch-options.zip
   ```

   O descarga [`decky-launch-options.zip`](https://github.com/PacificSilent/decky-launch-options/releases/latest)
   manualmente e instálalo con *Install plugin from zip*.

### Compilar a mano

```bash
pnpm install
pnpm build   # genera dist/index.js
pnpm test    # tests de la lógica de mezcla de opciones
```

Luego copia la carpeta del plugin (con `plugin.json`, `package.json`, `main.py` y `dist/`) a
`/home/deck/homebrew/plugins/decky-launch-options` en la Deck y reinicia Decky Loader.

## Cómo funciona

Steam interpreta el campo de opciones de lanzamiento así: si contiene `%command%`, ahí se
sustituye el comando real del juego (modo *wrapper*); si no lo contiene, todo el campo se
añade como argumentos del juego. El plugin respeta esa semántica al combinar comandos
(ver `src/launchOptions.ts`), y usa las APIs del cliente de Steam expuestas al frontend:
`SteamClient.Apps.RegisterForAppDetails` para leer las opciones actuales y
`SetAppLaunchOptions` / `SetShortcutLaunchOptions` para escribirlas.

## Créditos

El desarrollo de este plugin fue **asistido por IA** ([Claude Code](https://claude.com/claude-code)
de Anthropic), con dirección, pruebas en hardware real y feedback de
[PacificSilent](https://github.com/PacificSilent).

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE): puedes usarlo, modificarlo y
redistribuirlo libremente (incluso con fines comerciales) siempre que conserves el aviso de
copyright. Las contribuciones vía issues y pull requests son bienvenidas.
