import { store } from './file-models/store.yaml'
import { sdk } from './sdk'
import { config as bitcoinConfig } from 'bitcoind-startos/startos/actions/config/config'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const conf = await store.read().const(effects)

  // no dependencies if we are not managing wasabi settings
  if (!conf?.wasabi.managesettings) {
    return {}
  }

  var serverType = conf.wasabi.server.type
  if (serverType == 'bitcoind') {
    await sdk.action.request(effects, 'bitcoind', bitcoinConfig, 'important', {
      when: {
        condition: 'input-not-matches',
        once: false,
      },
      reason: 'Enable Compact Block Filters (BIP158) in Bitcoin Core',
      input: {
        kind: 'partial',
        value: {
          blockfilters: {
            blockfilterindex: true,
          },
        },
      },
    })

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
