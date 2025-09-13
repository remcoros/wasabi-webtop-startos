import { store } from './fileModels/store.yaml'
import { sdk } from './sdk'
import { config as bitcoinConfig } from 'bitcoind-startos/startos/actions/config/other'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const conf = await store.read().const(effects)

  const managesettings = conf?.wasabi.managesettings
  const serverType = conf?.wasabi.server.type
  if (managesettings && serverType == 'bitcoind') {
    await sdk.action.createTask(effects, 'bitcoind', bitcoinConfig, 'critical', {
      replayId: 'request-compact-block-filters',
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
        versionRange: '>=28.1:3-alpha.4',
      },
    }
  }

  // clear request if not using bitcoind
  await sdk.action.clearTask(effects, 'request-compact-block-filters')

  return {}
})
