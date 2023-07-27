# Webtop Instructions

Welcome to Webtop, your Immutable Linux Desktop, running 24/7 on your Start9 server!

## Initial Configuration

The initial configuration of Webtop is straightforward. You have two options:

1. **Go with the Defaults**: If you prefer simplicity, you can use the default settings for `Webtop title`, `Username` and `Password`. Simply click save and start the service.

2. **Customize Settings**: If you want to personalize your Webtop experience, you can customize the `Webtop title`, `Username` and `Password` to your liking. After making your changes, click save and start the service.

Now your Webtop is ready to be visited in your browser!

## Important Notes

1. Webtop utilizes HTTPS Basic Authentication. When users connect for the first time, their browser will automatically prompt them to log in. Subsequent connections will not require re-entering login credentials, unless the credentials are no longer valid.

2. This version of Webtop is Alpine Linux based. If you wish to install additional packages, you can do so using the command `apk add package-name`. However, please keep in mind that only the data inside the `/config` directory will persist when you restart the service. Any system-level installations or changes will be lost!

## Control Panel

By default, you can find the control panel on the left side of the Webtop interface. Webtop uses the KasmVNC client control panel, providing users with various options to control and interact with their session.

For more information about the available settings and functionalities of the control panel, please read the official KasmVNC documentation: [KasmVNC Client Documentation](https://www.kasmweb.com/kasmvnc/docs/latest/clientside.html)

## Good Luck!

Enjoy your Webtop experience and happy experimenting!
