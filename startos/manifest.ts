import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'wasabi-webtop',
  title: 'Wasabi Wallet',
  license: 'MIT',
  wrapperRepo: 'https://github.com/remcoros/wasabi-webtop-startos',
  upstreamRepo: 'https://github.com/remcoros/wasabi-webtop-startos',
  supportSite: 'https://github.com/WalletWasabi/WalletWasabi/issues',
  docsUrl:
    'https://github.com/remcoros/wasabi-webtop-startos/blob/main/instructions.md',
  marketingSite: 'https://wasabiwallet.io/',
  donationUrl: 'https://wasabiwallet.io/',
  description: {
    short: 'Wasabi Wallet - The Privacy focused Bitcoin wallet',
    long: "Wasabi on Webtop is a stripped down version of 'Webtop' (a Linux Desktop Environment) running the Wasabi wallet. This allows users to access a simple Linux desktop with Wasabi pre-installed directly from their web browser.",
  },
  volumes: ['main', 'userdir'],
  images: {
    main: {
      arch: ['x86_64'],
      source: {
        dockerTag: 'ghcr.io/remcoros/wasabi-webtop:2.6.0',
      },
    },
  },
  hardwareRequirements: {
    arch: ['x86_64'],
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    bitcoind: {
      description: 'Used to connect to your Bitcoin node.',
      optional: true,
      s9pk: null,
    },
  },
})
