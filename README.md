<p align="center">
  <img src="icon.png" alt="Wasabi Wallet Logo" width="21%">
</p>

# Wasabi Wallet on StartOS

> Everything not listed in this document should behave the same as upstream
> Wasabi Wallet. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Wasabi Wallet is a privacy-focused Bitcoin desktop wallet. It has no web interface of its own, so this package runs the real desktop application on a stripped-down Linux desktop and streams that desktop to the browser. Everything the user sees is upstream Wasabi, unmodified; what this package adds is the desktop around it, credentials for reaching it, and a wired-up connection to a local Bitcoin node.

- **Upstream repo:** <https://github.com/WalletWasabi/WalletWasabi>
- **Container image repo:** <https://github.com/remcoros/wasabi-webtop>
- **Wrapper repo:** <https://github.com/Start9-Community/wasabi-webtop-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, pulled rather than built. It is a community-maintained image that layers Wasabi and an openbox desktop onto LinuxServer's Selkies base, and it is built in its own repository — **nothing in this repository can change what is inside the container.**

| Property      | Value                                          |
| ------------- | ---------------------------------------------- |
| Image         | `ghcr.io/remcoros/wasabi-webtop`               |
| Architectures | x86_64 only; emulated as x86_64 on other hosts |
| Entrypoint    | The image's own, via `useEntrypoint`           |

| Subcontainer         | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `main`               | The `primary` daemon — the desktop, and the one to `attach` to          |
| `read-bitcoind-conf` | Short-lived, during init only; reads Bitcoin's `bitcoin.conf` read-only |

The manifest sets `hardwareAcceleration`, so StartOS binds whatever GPU device nodes the host has (`/dev/dri`, `/dev/nvidia*`, `/dev/kfd`) into the container. **Enable Wayland** selects the image's modern Wayland backend and defaults to on; turning it off selects the older X11 backend without otherwise disabling GPU use. A present but incompatible device can prevent automatic fallback and leave the Web UI blank or unstable. **Force Software Rendering** is the compatibility override for that case: it takes precedence over **Enable Wayland**, selects X11, disables DRI3/Zink application acceleration and automatic GPU selection, and forces and locks Selkies CPU video encoding. Software Wayland is deliberately not selected because Wasabi and the bundled file manager are X11 applications, and their Xwayland windows render black when the Wayland stack has no usable graphics device.

Software mode uses supported controls rather than a fake device path: `AUTO_GPU=false` suppresses the image's automatic GPU mode, `SELKIES_USE_CPU=true|locked` forces and locks CPU video encoding, and `DISABLE_DRI3=true` plus `DISABLE_ZINK=true` disable the X11 GPU paths. `LIBGL_ALWAYS_SOFTWARE=true` also forces Mesa software rendering for applications. This pinned image can still populate `DRI_NODE` internally when exactly one render node is present, but the locked CPU encoder does not use it. The device nodes remain visible because hardware access is a static manifest capability.

| Enable Wayland | Force Software Rendering | Effective desktop path               |
| -------------- | ------------------------ | ------------------------------------ |
| On             | Off                      | Wayland with automatic GPU selection |
| Off            | Off                      | X11 with normal GPU detection        |
| On or off      | On                       | CPU-only X11 compatibility mode      |

The manifest also sets `nvidiaContainer` on the image, which layers the host's NVIDIA userspace driver over the image on an NVIDIA-flavored StartOS install. On any other host that flag is a silent no-op — the overlay simply does not exist, and the package runs unchanged.

StartOS binds those device nodes as root, so `main.ts` relaxes the mode on `/dev/dri/*` before starting a hardware-enabled daemon; without it the unprivileged desktop user cannot open them. It deliberately skips that step in forced-software mode.

The daemon receives `PUID`/`PGID` (both `1000`), `TZ`, `PIXELFLUX_WAYLAND`, and three values from the package's own settings: `TITLE` (the browser tab title), `CUSTOM_USER`, and `PASSWORD`. When **Force Software Rendering** is enabled it also receives the software-path environment described above; otherwise those variables are absent and the image chooses its normal renderer and encoder. The credentials and rendering choices are read fresh on every start, so changing them in **Settings** takes effect on the next restart.

## Volume and Data Layout

Two volumes, and only one of them matters. All wallet state lives on `userdir`.

| Volume    | Mount Point  | Purpose                                                                      |
| --------- | ------------ | ---------------------------------------------------------------------------- |
| `userdir` | `/config`    | The desktop user's home — **wallet files, keys, coin labels, Wasabi config** |
| `main`    | `/root/data` | This package's own settings file only; the application never reads it        |

Inside `userdir`, Wasabi keeps everything under `.walletwasabi/client/`: `Wallets/` (the wallet files, which hold the keys), `Config.json`, `UiConfig.json`, `BitcoinStore/` (a rebuildable cache of block filters and known transactions), and logs.

Note that the container image's entrypoint rewrites `/config/.config/openbox/autostart` on every start, so a hand-edited desktop autostart does not survive a restart. That is the image's behavior, not this package's.

## File Models

Three files, one owned outright by the package and two shared with Wasabi. The shared two are only ever merged into, never rewritten, because the package models a handful of keys out of dozens.

| Model                                | Volume    | Ownership                                                         |
| ------------------------------------ | --------- | ----------------------------------------------------------------- |
| `start9/config.yaml`                 | `main`    | The package's; written by the **Settings** action and by init     |
| `.walletwasabi/client/Config.json`   | `userdir` | Shared — some keys re-asserted every start, the rest are Wasabi's |
| `.walletwasabi/client/UiConfig.json` | `userdir` | Shared — two keys re-asserted every start, the rest are Wasabi's  |

`start9/config.yaml` holds the desktop title, username and password, the Wayland and software-rendering toggles, the Bitcoin-node choice, the Tor toggle, the JSON-RPC settings, and the Bitcoin RPC credential the package generated for itself. It is the source of truth for everything the package asserts elsewhere, and it is what makes those decisions survive a restart. Existing settings files without the rendering keys migrate to Wayland enabled and software rendering disabled.

Both Wasabi files are seeded once, on first start, by copying the image's `/defaults` copies into `/config` if they are not already there. After that they belong to Wasabi — except for the keys below.

The seeded `Config.json` is also repaired at that moment: the image stamps it with a schema number Wasabi does not accept, and Wasabi's reaction to a config it cannot decode is to overwrite the whole file with its own defaults. Left alone that would silently undo every setting below on the very first start — including the Bitcoin connection — so the package corrects the schema number before Wasabi ever reads the file. The repair applies only to a file the package just seeded; a config Wasabi has already written is never relabelled.

**Re-asserted on every start, while "Apply Settings On Startup" is on** (this is the answer to "why did my setting revert"): in `Config.json`, `BitcoinRpcEndPoint`, `BitcoinRpcCredentialString`, `UseTor`, `JsonRpcServerEnabled`, `JsonRpcUser`, `JsonRpcPassword` and `JsonRpcServerPrefixes`. Changing any of these inside Wasabi's own settings screen will not stick. Turn "Apply Settings On Startup" off in the **Settings** action to hand all of them back to Wasabi — that toggle exists precisely to release ownership.

**Re-asserted on every start, unconditionally**: in `UiConfig.json`, `Oobe` (so the onboarding wizard does not reappear) and `WindowState` (`Maximized`, because the window manager's own fullscreen glitches Wasabi's rendering — a window that renders incorrectly rather than merely slowly is usually a stale `WindowState`, and restarting the service puts it back). Every other UI preference — dark mode, fee target, autocopy, the last selected wallet — is seeded once and then yours.

Wasabi writes both files with a UTF-8 byte-order mark, which the JSON models cannot parse, so the package strips it in the container before each merge. A hand edit that keeps the file valid JSON survives; one that corrupts it does not — and that failure is the worst-presenting one this package has. The service sits in "starting" with no error banner, an empty status field, and **nothing at all in the service logs**, because the parse happens before the container starts; StartOS simply retries every ten seconds forever. The only message is on the host, in `journalctl -u startd`, as a `SyntaxError` from `JSON.parse`. Both files are under `.walletwasabi/client/` on the `userdir` volume: fix the JSON and the next attempt succeeds, or delete the file and let the package re-seed and repair it.

## Dependencies

One, and it is optional — Wasabi will run against its own network backend if you have no node.

| Dependency | Required | Mounted                                    | Why                                                        |
| ---------- | -------- | ------------------------------------------ | ---------------------------------------------------------- |
| `bitcoind` | Optional | `main` volume, read-only, during init only | Fetch blocks and broadcast transactions over your own node |

The dependency is only declared when **Settings** has both "Apply Settings On Startup" enabled and the Bitcoin node set to "Local Node"; select "None" and it disappears. There is no health-check gate — the package resolves Bitcoin's RPC bridge address at startup and fails to start if it cannot, rather than waiting on Bitcoin to be synced.

The read-only mount exists for one purpose: to read `bitcoin.conf` and check whether the RPC user this package generated for itself has been registered on the Bitcoin side yet. Nothing is ever written through it.

## Network Access and Interfaces

Two interfaces, one of which only exists when you ask for it.

| Interface | Id    | Type | Port  | Description                               |
| --------- | ----- | ---- | ----- | ----------------------------------------- |
| Web UI    | `ui`  | ui   | 3000  | The Wasabi desktop, streamed to a browser |
| JSON-RPC  | `rpc` | api  | 37128 | Wasabi's RPC API, for automation          |

The Web UI is the desktop itself and is protected by HTTP Basic Auth using the username and password from **Settings** — the browser prompts on first visit. Neither interface is masked.

The JSON-RPC interface is only published while "Enable JSON-RPC" is on. Note that it is the package's **Settings** action that widens Wasabi's RPC listener from loopback to all interfaces, and it only does that while "Apply Settings On Startup" is on; with that toggle off, the interface is published but Wasabi is still listening on loopback only, and you must widen it yourself inside Wasabi.

## Installation and First-Run Flow

Installing does not produce a usable service on its own — the desktop needs a login before it can be started, so the package raises a critical task instead of inventing one silently.

1. On install, a critical **Settings** task blocks the service from starting. Running it writes the package's settings file for the first time, with a generated password.
2. If Bitcoin is installed at that moment, the node selection defaults to "Local Node"; otherwise it defaults to "None".
3. With "Local Node" selected, init generates a username and a random RPC password for itself, then raises a critical task on **Bitcoin's** page asking it to register that credential. A second critical task on Bitcoin's page asks for compact block filters (BIP158), which Wasabi needs to scan the chain privately.
4. Once both Bitcoin tasks are done, start the service and open the Web UI. One start is enough — the node connection is live from the first one, and the service logs say so: `Starting Bitcoin Rpc Interface Monitoring`.

Wasabi's own onboarding wizard is suppressed — the package sets `Oobe` to false — so the first thing you see is the wallet chooser, not a setup flow.

## Actions

Two, both user-facing, both in a **Configuration** group.

**Settings** (`config`) — the only way to configure the package. Run it to set the desktop's browser-tab title, username and password; to select Wayland or X11 and optionally force the CPU-only X11 compatibility path; to choose between a local Bitcoin node and none; to toggle Tor; and to enable Wasabi's JSON-RPC server. It writes only the package's own settings file; nothing reaches Wasabi until the next start, so **restart the service for a change to take effect**. It is safe to run repeatedly and takes no meaningful time. Changing the node selection re-derives the dependency and the tasks on Bitcoin's page.

**Show UI Credentials** (`ui-credentials`) — read-only; returns the desktop username and password, the password masked and both copyable. Run it when the browser has forgotten the Basic Auth prompt or you need to hand the login to someone. It changes nothing. It is hidden until **Settings** has been run at least once, because there is nothing to show before that.

## Tasks

Three, all `critical` — the package raises one on itself and two on Bitcoin's page. A critical task blocks the service from starting and replaces the ordinary controls, so a service that "won't start and has no buttons" is almost always waiting on one of these.

| Task                              | Where it appears | Raised when                                                                             | Cleared by                                        |
| --------------------------------- | ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Choose a username and password    | This service     | On install, when no settings file exists yet                                            | Running **Settings** once                         |
| Create RPC credentials for Wasabi | Bitcoin          | Bitcoin's `bitcoin.conf` has no `rpcauth` entry for the username this package generated | Running Bitcoin's credential action from the task |
| Enable Compact Block Filters      | Bitcoin          | Bitcoin's `blockfilterindex` setting is off                                             | Turning it on in Bitcoin's **Other Settings**     |

The two Bitcoin tasks only exist while the node selection is "Local Node"; switching to "None" clears both. They can return — the credential task comes back if the `rpcauth` entry is later removed, and the block-filter task re-raises whenever the setting is turned back off, because it re-checks rather than firing once.

The credential task supplies both the username and the password and renders them read-only, so the user cannot edit them. Bitcoin refuses a password shorter than its own floor, which is why this package rotates a too-short credential itself before raising the task rather than raising one the user could never submit.

## Health Checks

One, on the only daemon.

| Check     | Displayed       | Method                                    |
| --------- | --------------- | ----------------------------------------- |
| `primary` | "Web Interface" | An HTTP request to the desktop's own port |

Any HTTP response counts as healthy, including the `401` that Basic Auth returns before you log in — the check is asking "is the desktop serving", not "are your credentials right". A failure that clears within a minute or so of starting is the desktop still coming up. One that persists means the container did not start: check the service logs, and expect either a settings file the package could not parse or a Wasabi config file it could not read.

**A green check says nothing about how Wasabi is getting its blocks**, and that is the gap worth knowing, because falling back to public peers is a privacy question rather than a visible fault. The service log settles it: `Starting Bitcoin Rpc Interface Monitoring` means Wasabi is on your node, and `No Bitcoin Node RPC was configured. Trying P2P synchronization.` means it is not. When it is not, check three things in order — that Bitcoin is running, that its `bitcoin.conf` still carries the `rpcauth` entry for the username this package generated (the credential task re-raises when it does not, and running it restores the entry after Bitcoin was reinstalled or reset), and that "Apply Settings On Startup" is on, since with it off the connection is yours to configure inside Wasabi. A wallet that stays green while never finding its transactions is the neighbouring case: compact block filters are off on the Bitcoin side, the block-filter task re-raises whenever they are, and Bitcoin has to build the index before Wasabi can use it.

## Backups and Restore

Both volumes are copied wholesale — `sdk.Backups.ofVolumes('main', 'userdir')` — with nothing excluded and no dump step. **The wallet files and keys under `userdir` are captured**, along with coin labels and every Wasabi preference, and so is the package's own settings file.

Nothing is excluded, which means the block-filter and transaction cache under `.walletwasabi/client/BitcoinStore/` is in the backup too. It is rebuildable and inflates the archive; the image ships a `.backupignore` naming it, but that file is a convention of other backup systems and StartOS does not read it, so it has no effect here.

A restored instance is usable immediately: the same desktop credentials, the same wallets, the same labels. If it was using a local node, that node must be installed and must still carry the `rpcauth` entry for the RPC username in the restored settings file — if it does not, the credential task will re-raise on Bitcoin's page and clear once you run it.

## Limitations and Differences

1. **x86_64 only in practice.** The image is not built for aarch64 or riscv64, and the manifest leaves the default emulation fallback in place, so those hosts run it emulated — a full desktop under emulation is not a usable experience.
2. **No USB, so no hardware wallets.** Nothing is passed through to the container, so Coldcard, Trezor, Ledger and friends cannot be used. This is the single biggest difference from running Wasabi on a laptop.
3. **No camera**, so QR codes cannot be scanned — paste instead.
4. **One session.** The desktop is a single X session; opening the Web UI in a second browser attaches to the same one rather than starting another.
5. **Some settings are not yours while "Apply Settings On Startup" is on.** See [File Models](#file-models) for exactly which, and how to take them back.
6. **Tor is Wasabi's own, not the StartOS one.** The "Use Tor" toggle configures the Tor client bundled inside Wasabi. It is unrelated to whether StartOS publishes this service's interfaces over Tor.
7. **The desktop's other applications are incidental.** A file manager, a terminal and a text editor come with the image; they are not part of what this package supports.

---

## Quick Reference for AI Consumers

```yaml
package_id: wasabi-webtop
image: ghcr.io/remcoros/wasabi-webtop
architectures:
  - x86_64
subcontainers:
  - main # the primary daemon, the desktop
  - read-bitcoind-conf # init-time only, reads bitcoin.conf read-only
volumes:
  userdir: /config # wallet files, keys, Wasabi config
  main: /root/data # package settings only
file_models:
  - start9/config.yaml # on `main`
  - .walletwasabi/client/Config.json # on `userdir`
  - .walletwasabi/client/UiConfig.json # on `userdir`
startos_managed_env_vars:
  - PUID
  - PGID
  - TZ
  - TITLE
  - CUSTOM_USER
  - PASSWORD
  - PIXELFLUX_WAYLAND # false when Enable Wayland is off or software rendering is forced
  - AUTO_GPU # false only while Force Software Rendering is enabled
  - SELKIES_USE_CPU # true|locked only while Force Software Rendering is enabled
  - DISABLE_DRI3 # true only while Force Software Rendering is enabled
  - DISABLE_ZINK # true only while Force Software Rendering is enabled
  - LIBGL_ALWAYS_SOFTWARE # true only while Force Software Rendering is enabled
dependencies:
  - bitcoind # optional; only when the node selection is "Local Node"
interfaces:
  ui: { type: ui, port: 3000 }
  rpc: { type: api, port: 37128 } # only while JSON-RPC is enabled
actions:
  - config
  - ui-credentials
tasks:
  - { action: config, severity: critical }
  - { action: generate-rpc-dependent, severity: critical } # on bitcoind
  - { action: other-config, severity: critical } # on bitcoind
health_checks:
  - primary # displayed "Web Interface"
```
