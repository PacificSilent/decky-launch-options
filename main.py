import decky


class Plugin:
    """Frontend-only plugin: all the work happens in the Steam client UI.

    The backend just logs lifecycle events so problems are visible in
    ~/homebrew/logs.
    """

    async def _main(self):
        decky.logger.info("Launch Options Injector loaded")

    async def _unload(self):
        decky.logger.info("Launch Options Injector unloaded")

    async def _uninstall(self):
        decky.logger.info("Launch Options Injector uninstalled")
