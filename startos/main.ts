import * as fs from 'node:fs/promises'
import { sdk } from './sdk'
import { T, utils } from '@start9labs/start-sdk'
import { uiPort } from './utils'
import { store } from './file-models/store.yaml'
import { configFile, ConfigFileType } from './file-models/config.json'
import { uiConfigFile } from './file-models/uiConfig.json'

export const main = sdk.setupMain(async ({ effects, started }) => {
  console.info('setupMain: Setting up Wasabi webtop...')

  // setup a watch on the store file for changes (this restarts the service)
  const conf = (await store.read().const(effects))!

  if (!conf.password) {
    throw new Error('Password is required')
  }

  /*
   * Subcontainer setup
   */
  let mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/root/data',
      readonly: false,
    })
    .mountVolume({
      volumeId: 'userdir',
      subpath: null,
      mountpoint: '/config',
      readonly: false,
    })

  // main subcontainer (the webtop container)
  const subcontainer = await sdk.SubContainer.of(
    effects,
    {
      imageId: 'main',
    },
    mounts,
    'main',
  )

  /*
   * Wasabi settings
   */

  // create default config file if it does not exist
  const configFilePath = `${subcontainer.rootfs}/config/.walletwasabi/client/Config.json`
  try {
    await fs.access(configFilePath, fs.constants.F_OK) // check if configFile exists
  } catch (e) {
    console.log('Config.json file does not exist, creating it')
    await subcontainer.exec([
      'sh',
      '-c',
      `
         mkdir -p /config/.walletwasabi/client && 
         cp /defaults/.walletwasabi/client/Config.json /config/.walletwasabi/client/Config.json && 
         chown -R 1000:1000 /config/.walletwasabi
        `,
    ])
  }

  const uiConfigFilePath = `${subcontainer.rootfs}/config/.walletwasabi/client/UiConfig.json`
  try {
    await fs.access(uiConfigFilePath, fs.constants.F_OK) // check if configFile exists
  } catch (e) {
    console.log('UiConfig.json file does not exist, creating it')
    await subcontainer.exec([
      'cp',
      '/defaults/.walletwasabi/client/UiConfig.json',
      '/config/.walletwasabi/client/UiConfig.json',
    ])
  }

  await subcontainer.exec([
    'chown',
    '-R',
    '1000:1000',
    '/config/.walletwasabi/client',
  ])

  // Force windowstate to full-screen. We used to do this through the openbox rc.xml
  // config, but this causes graphical glitches in Wasabi.
  uiConfigFile.merge(effects, {
    WindowState: 'FullScreen',
  })

  if (conf.wasabi.managesettings) {
    let config: Partial<ConfigFileType> = {
      // Update config version so Wasabi will not try to migrate it
      ConfigVersion: 2,
    }

    // server config
    if (conf.wasabi.server.type == 'bitcoind') {
      // get ip of bitcoind container      
      const bitcoindIp = (
        await subcontainer.exec([
          'sh',
          '-c',
          "getent hosts bitcoind.startos | awk '{print $1}",
        ])
      ).stdout
      config = {
        ...config,
        UseBitcoinRpc: true,
        MainNetBitcoinRpcEndPoint: `${bitcoindIp}:8332`,
        MainNetBitcoinRpcCredentialString:
          conf.wasabi.server.user + ':' + conf.wasabi.server.password,
      }
    } else if (conf.wasabi.server.type == 'none') {
      config = {
        ...config,
        UseBitcoinRpc: false,
        MainNetBitcoinRpcEndPoint: '127.0.0.1:8332',
        MainNetBitcoinRpcCredentialString: '',
      }
    }

    config = {
      ...config,
      // Tor
      UseTor: conf.wasabi.useTor ? 'Enabled' : 'Disabled',
      // JSON RPC server
      JsonRpcServerEnabled: conf.wasabi.rpc.enable,
      JsonRpcUser: conf.wasabi.rpc.username,
      JsonRpcPassword: conf.wasabi.rpc.password,
      JsonRpcServerPrefixes: ['http://+:37128/'],
    }

    // merge with existing config file
    configFile.merge(effects, config)
  }

  /*
   * Health checks
   */
  const healthReceipts: T.HealthCheck[] = []

  /*
   * Daemons
   */
  return sdk.Daemons.of(effects, started, healthReceipts).addDaemon('primary', {
    subcontainer: subcontainer,
    command: ['docker_entrypoint.sh'],
    runAsInit: true, // If true, this daemon will be run as PID 1 in the container.
    env: {
      PUID: '1000',
      PGID: '1000',
      TZ: 'Etc/UTC',
      TITLE: conf.title,
      CUSTOM_USER: conf.username,
      PASSWORD: conf.password,
      RECONNECT: conf.reconnect ? 'true' : 'false',
    },
    ready: {
      display: 'Web Interface',
      fn: () =>
        sdk.healthCheck.checkWebUrl(
          effects,
          'http://wasabi-webtop.startos:' + uiPort,
          {
            successMessage: 'The web interface is ready',
            errorMessage: 'The web interface is unreachable',
          },
        ),
    },
    requires: [],
  })
})
