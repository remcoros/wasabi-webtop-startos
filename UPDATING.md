# Updating the upstream version

This package wraps two upstream projects, and they move together:

- **Wasabi Wallet** ([WalletWasabi/WalletWasabi](https://github.com/WalletWasabi/WalletWasabi)) — the wallet itself.
- **wasabi-webtop** ([remcoros/wasabi-webtop](https://github.com/remcoros/wasabi-webtop)) — the community-maintained Docker image that puts Wasabi on a Selkies/openbox desktop. It owns the Dockerfile, the desktop configuration, and the seed `Config.json` / `UiConfig.json`. This repository only pulls the image it publishes.

A new Wasabi release is only installable here once `wasabi-webtop` has cut a matching tag and pushed the image to `ghcr.io/remcoros/wasabi-webtop`.

## Determining the upstream version

- **Latest Wasabi release:**

  ```sh
  gh release view -R WalletWasabi/WalletWasabi --json tagName -q .tagName
  ```

- **Confirm that a candidate image tag exists:**

  ```sh
  docker manifest inspect 'ghcr.io/remcoros/wasabi-webtop:<candidate-tag>'
  ```

  Choose a candidate from the image repository releases and confirm its registry manifest above. A git tag alone does not prove the image has been published. Wallet and image versions are usually the same string minus the leading `v`, but not always — the image repo cuts its own revisions (e.g. `v2.7.2.1` against Wasabi 2.7.2) when only the desktop changes.

The current pin lives in `startos/versions/current.ts` as `WASABI_VERSION`, which `startos/manifest/index.ts` interpolates into `images.main.source.dockerTag`.

## Applying the bump

1. Set `WASABI_VERSION` in `startos/versions/current.ts` to the image tag without its leading `v`.
2. Bump `version` in the same file to the new Wasabi version with the downstream revision reset to `:0`, and rewrite `releaseNotes` in all five locales — summarise the upstream highlights and link the Wasabi release. If the outgoing `current.ts` has a nonempty `up` migration, first move it to a version-named historical file, rename its export, and add it to `versions/index.ts`; migrations stay attached to the version that introduced them.
3. Confirm the image tag resolves before building:

   ```sh
   docker manifest inspect 'ghcr.io/remcoros/wasabi-webtop:<version>'
   ```

4. `make x86` — the image is x86_64 only, so `ARCHES := x86` in the `Makefile` is deliberate.

## Two things to re-check on every bump

**The config schema number.** `wasabiConfigVersion` in `startos/utils.ts` must equal the `ConfigVersion` in upstream's `PersistentConfigManager.DefaultMainNetConfig` (`WalletWasabi.Client/Configuration/PersistentConfigManager.cs`). `main.ts` stamps it onto the freshly seeded `Config.json` because the image seeds a schema number Wasabi rejects — see `AGENTS.md`. If a release introduces a genuinely newer schema with a real migration, bump the constant rather than leaving the old value stamped on, or the migration is skipped.

**The keys the package writes.** If the release changes anything Wasabi reads out of `Config.json` or `UiConfig.json`, check `startos/fileModels/` against both the new seed files in the image repo's `root/defaults/.walletwasabi/client/` and the decoder in upstream's `WalletWasabi.Client/Configuration/Serialization.cs`, which is the authority on key names and which are required.

After any bump, verify on hardware that the **first** start reaches the node: the log must show `Starting Bitcoin Rpc Interface Monitoring` and must not show `No Bitcoin Node RPC was configured. Trying P2P synchronization.`
