import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v2_6_0 = VersionInfo.of({
  version: '2.6.0:0.2',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
