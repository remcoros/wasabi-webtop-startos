import { store } from './file-models/store.yaml'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const conf = await store.read().const(effects)

  // no dependencies if we are not managing wasabi settings
  if (!conf?.wasabi.managesettings) {
    return {}
  }

  var serverType = conf.wasabi.server.type
  if (serverType == 'bitcoind') {
    return {
      bitcoind: {
        kind: 'exists',
        // @todo update version range
        versionRange: '^28.1.0-0',
      },
    }
  }

  return {}
})
