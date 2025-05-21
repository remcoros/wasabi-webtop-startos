import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { config } from '../actions/config'
import { createDefaultStore } from '../file-models/store.yaml'

const createDefaultStoreInitScript = sdk.setupOnInstallOrUpdate(async (effects) => {
  await createDefaultStore(effects)
})

const setupPostInstall = sdk.setupOnInstall(async (effects) => {
  // require the config action to run once, to have a password for the ui set
  await sdk.action.createOwnTask(effects, config, 'critical', {
    reason: 'Configure default settings',
  })
})

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  createDefaultStoreInitScript,
  setInterfaces,
  setDependencies,
  actions,
  setupPostInstall,
)

export const uninit = sdk.setupUninit(versionGraph)
