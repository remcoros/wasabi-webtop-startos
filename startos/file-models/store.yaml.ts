import { matches, FileHelper, T } from '@start9labs/start-sdk'
const { object, string, boolean, oneOf, literal } = matches

const shape = object({
  title: string,
  username: string,
  password: string.optional(),
  reconnect: boolean.onMismatch(false),
  wasabi: object({
    managesettings: boolean,
    server: object({
      type: oneOf(literal('bitcoind'), literal('none')).onMismatch('bitcoind'),
      user: string,
      password: string,
    }),
    useTor: boolean,
    rpc: object({
      enable: boolean,
      username: string.optional(),
      password: string.optional(),
    }),
  }),
})

export type StoreType = typeof shape._TYPE

export const store = FileHelper.yaml(
  '/media/startos/volumes/main/start9/config.yaml',
  shape,
)

export const createDefaultStore = async (effects: T.Effects) => {
  // check if the file exists (from previous installs or upgrades)
  const conf = await store.read().once()
  if (conf) {
    console.log('Wasabi config file already exists, clearing RPC credentials')
    await store.merge(effects, {
      wasabi: {
        server: {
          user: '',
          password: '',
        },
      },
    })
    return
  }

  // config file does not exist, create it
  console.log('Wasabi config file does not exist, creating it')
  const installedPackages = await effects.getInstalledPackages()
  const serverType = installedPackages.includes('bitcoind')
    ? 'bitcoind'
    : 'none'

  await store.write(effects, {
    title: 'Wasabi Wallet on StartOS',
    username: 'webtop',
    reconnect: false,
    wasabi: {
      managesettings: true,
      server: {
        type: serverType,
        user: '',
        password: '',
      },
      useTor: true,
      rpc: {
        enable: false
      },
    },
  })
}
