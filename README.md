# Decky Launch Options Injector

Plugin de [Decky Loader](https://decky.xyz/) para Steam Deck que permite inyectar un comando
(por defecto `~/lsfg %command%`, el wrapper de [decky-lsfg-vk](https://github.com/xXJSONDeruloXx/decky-lsfg-vk))
en las **Configuraciones de Lanzamiento** de cualquier juego, tanto de Steam como non-Steam,
sin pisar lo que el usuario ya tenía configurado.

## Características

- ✅ Funciona con juegos de **Steam** y accesos directos **non-Steam** (usa `SetShortcutLaunchOptions` cuando corresponde).
- ✅ El comando se **inyecta preservando** las opciones existentes:
  - Campo vacío → `~/lsfg %command%`
  - `GAMEMODE=1 %command%` → `GAMEMODE=1 ~/lsfg %command%` (el wrapper queda pegado al juego)
  - `-fullscreen` (argumentos sueltos) → `~/lsfg %command% -fullscreen`
- ✅ Quitar el comando **restaura** las opciones anteriores.
- ✅ Comando editable y persistente (por si quieres inyectar otra cosa: `mangohud %command%`, etc.).
- ✅ Buscador para filtrar tu biblioteca desde el menú de acceso rápido (QAM).

## Uso

1. Abre el menú de acceso rápido (botón `...`) y entra al plugin **Launch Options**.
2. Ajusta el comando si hace falta (por defecto `~/lsfg %command%`).
3. Busca el juego y activa el toggle: el comando se añade a sus opciones de lanzamiento.
   Desactívalo para quitarlo y recuperar las opciones anteriores.

## Instalación

### Desde un zip (Release / artifact de CI)

1. Descarga `decky-launch-options.zip` desde Releases o desde el artifact del workflow de GitHub Actions.
2. En Decky Loader: engranaje → activa *Developer mode* → pestaña *Developer* → *Install plugin from zip*.

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

## Licencia

MIT
