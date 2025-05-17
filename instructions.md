# Wasabi Instructions

Welcome to Wasabi on Webtop, your favourite desktop wallet in an Immutable Linux Desktop, running 24/7 on your Start9 server!

## Initial Configuration

The initial configuration of Wasabi is straightforward. You have two options:

1. **Go with the Defaults**: If you prefer simplicity, you can use the default settings for `Webtop title`, `Username` and `Password`. Simply click save and start the service.

2. **Customize Settings**: If you want to personalize your Webtop experience, you can customize the `Webtop title`, `Username` and `Password` to your liking. After making your changes, click save and start the service.

Now your Wasabi on Webtop is ready to be visited in your browser!

## Important Notes

1. Webtop is an Immutable Linux Desktop environment running in a container. Any changes outside the home directory will **NOT** be persisted and **lost** after a restart and/or update! The home directory (`/config`) is stored outside the container and will be persisted accross restarts and included in StartOS backups. Most applications (like Wasabi and the File Manager) persist their settings in a file or directory in the /config directory, so users can customize the experience a little bit.

2. Wasabi stores users wallet files, settings and logs in the home directory (`/config/.walletwasabi/`) so they will be available again after a restart or update. They are also included in StartOS backups.

3. Webtop utilizes HTTPS Basic Authentication. When users connect for the first time, their browser will automatically prompt them to log in. Subsequent connections will not require re-entering login credentials, unless the credentials are no longer valid.

4. This version of Webtop is Debian Linux based. A default configuration for Wasabi is installed if none exist in your user (/config) directory. By default it connects to the installed `bitcoin` instance.

5. Wasabi on Webtop does not support camera's or usb devices. Which is something to remember when setting up wallets.

## Control Panel

By default, you can find the control panel on the left side of the Webtop interface. Webtop uses the KasmVNC client control panel, providing users with various options to control and interact with their session.

For more information about the available settings and functionalities of the control panel, please read the official KasmVNC documentation: [KasmVNC Client Documentation](https://www.kasmweb.com/kasmvnc/docs/latest/clientside.html)

## Good Luck!

Enjoy your Wasabi on Webtop experience and happy experimenting!
