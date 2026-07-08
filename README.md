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
