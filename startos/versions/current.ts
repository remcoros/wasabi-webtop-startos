import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.0:0-beta.1',
  releaseNotes: {
    en_US: 'Update to Wasabi 2.8.0 (master branch)',
    es_ES: 'Actualización a Wasabi 2.8.0 (rama master)',
    de_DE: 'Aktualisierung auf Wasabi 2.8.0 (Master-Zweig)',
    pl_PL: 'Aktualizacja do Wasabi 2.8.0 (gałąź master)',
    fr_FR: 'Mise à jour vers Wasabi 2.8.0 (branche master)',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

export const WASABI_VERSION = '2.7.2.1'
