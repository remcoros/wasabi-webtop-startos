import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const WASABI_VERSION = '2.8.5'

export const current = VersionInfo.of({
  version: '2.8.5:1',
  releaseNotes: {
    en_US: 'Updates the StartOS SDK. Wasabi Wallet remains at version 2.8.5.',
    es_ES:
      'Actualiza el SDK de StartOS. Wasabi Wallet permanece en la versión 2.8.5.',
    de_DE:
      'Aktualisiert das StartOS-SDK. Wasabi Wallet bleibt auf Version 2.8.5.',
    pl_PL: 'Aktualizuje SDK StartOS. Wasabi Wallet pozostaje w wersji 2.8.5.',
    fr_FR: 'Met à jour le SDK StartOS. Wasabi Wallet reste en version 2.8.5.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
