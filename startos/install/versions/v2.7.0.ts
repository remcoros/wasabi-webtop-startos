import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v2_7_0 = VersionInfo.of({
  version: '2.7.0:1.0',
  releaseNotes: 'Update Wasabi to 2.7.0',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
