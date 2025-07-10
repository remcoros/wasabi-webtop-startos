import { sdk } from '../sdk'
import { T, utils } from '@start9labs/start-sdk'
import { createDefaultStore, store } from '../fileModels/store.yaml'
import { Variants } from '@start9labs/start-sdk/base/lib/actions/input/builder'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  title: Value.text({
    name: 'Webtop Title',
    description:
      'This value will be displayed as the title of your browser tab.',
    required: true,
    default: 'Wasabi Wallet on StartOS',
    placeholder: 'Wasabi Wallet on StartOS',
    patterns: [utils.Patterns.ascii],
  }),
  username: Value.text({
    name: 'Username',
    description: 'The username for logging into your Webtop.',
    required: true,
    default: 'webtop',
    placeholder: '',
    masked: false,
    patterns: [utils.Patterns.ascii],
  }),
  password: Value.text({
    name: 'Password',
    description: 'The password for logging into your Webtop.',
    required: true,
    generate: {
      charset: 'a-z,0-9',
      len: 20,
    },
    default: { charset: 'a-z,0-9', len: 20 },
    placeholder: '',
    masked: true,
    minLength: 8,
  }),
  reconnect: Value.toggle({
    name: 'Automatically reconnect',
    description:
      'Automatically reconnect when the connection to the desktop is lost or the browser tab has been idle for too long.',
    default: false,
  }),
  wasabi: Value.object(
    {
      name: 'Wasabi settings',
      description: 'Wasabi settings',
    },
    InputSpec.of({
      managesettings: Value.toggle({
        name: 'Apply settings on startup',
        description:
          'Disable to manage your own server and proxy settings in Wasabi',
        default: true,
      }),
      server: Value.dynamicUnion(async ({ effects }) => {
        // determine default server type and disabled options
        const installedPackages = await effects.getInstalledPackages()
        let serverType: 'bitcoind' | 'none' = installedPackages.includes(
          'bitcoind',
        )
          ? 'bitcoind'
          : 'none'

        return {
          name: 'Bitcoin Node',
          description: 'The Bitcoin node to connect to',
          default: serverType,
          disabled: false,
          variants: Variants.of({
            bitcoind: {
              name: 'Local Node (recommended)',
              spec: InputSpec.of({}),
            },
            none: {
              name: 'None (not recommended)',
              spec: InputSpec.of({}),
            },
          }),
        }
      }),
      useTor: Value.toggle({
        name: 'Use Tor',
        description: 'Configure Wasabi to use the Tor network',
        default: true,
      }),
      rpc: Value.object(
        {
          name: 'RPC Server settings',
          description: 'Wasabi Json-RPC server settings.',
        },
        InputSpec.of({
          enable: Value.toggle({
            name: 'Enable RPC',
            description: 'Enable the Wasabi JSON-RPC server',
            default: false,
          }),
          username: Value.text({
            name: 'RPC Username',
            description: 'The username for the Wasabi JSON-RPC server',
            required: true,
            default: 'wasabi',
            placeholder: '',
            patterns: [utils.Patterns.ascii],
          }),
          password: Value.text({
            name: 'Password',
            description: 'Password for the JSON-RPC server.',
            required: true,
            generate: {
              charset: 'a-z,0-9',
              len: 20,
            },
            default: { charset: 'a-z,0-9', len: 20 },
            placeholder: '',
            masked: true,
            minLength: 8,
          }),
        }),
      ),
    }),
  ),
})

export const config = sdk.Action.withInput(
  // id
  'config',

  // metadata
  async ({ effects }) => ({
    name: 'Settings',
    description: 'Username/password and connection settings',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => readSettings(effects),

  // the execution function
  ({ effects, input }) => writeSettings(effects, input),
)

type InputSpec = typeof inputSpec._TYPE
type PartialInputSpec = typeof inputSpec._PARTIAL

async function readSettings(effects: T.Effects): Promise<PartialInputSpec> {
  let settings = await store.read().once()
  if (!settings) {
    await createDefaultStore(effects)
    settings = (await store.read().once())!
  }

  return {
    title: settings.title,
    username: settings.username,
    password: settings.password,
    reconnect: settings.reconnect,
    wasabi: {
      managesettings: settings.wasabi.managesettings,
      server: {
        selection: settings.wasabi.server.type,
      },
      useTor: settings.wasabi.useTor,
      rpc: {
        enable: settings.wasabi.rpc.enable,
        username: settings.wasabi.rpc.username,
        password: settings.wasabi.rpc.password,
      },
    },
  }
}

async function writeSettings(effects: T.Effects, input: InputSpec) {
  // clear any previous reset-rpc-auth action
  await sdk.action.clearTask(effects, 'reset-rpc-auth')

  if (
    input.wasabi.managesettings &&
    input.wasabi.server.selection == 'bitcoind'
  ) {
    console.log('using bitcoind server')

    const currentConf = await store.read().once()
    // check if we need to request new credentials
    if (
      !currentConf?.wasabi.server.user ||
      !currentConf?.wasabi.server.password
    ) {
      console.log('resetting rpc credentials')

      await sdk.action.run({
        actionId: 'reset-rpc-auth',
        effects,
        input: {},
      })
    }
  }

  await store.merge(effects, {
    title: input.title,
    username: input.username,
    password: input.password,
    reconnect: input.reconnect,
    wasabi: {
      managesettings: input.wasabi.managesettings,
      server: {
        type: input.wasabi.server.selection,
      },
      useTor: input.wasabi.useTor,
      rpc: {
        enable: input.wasabi.rpc.enable,
        username: input.wasabi.rpc.username,
        password: input.wasabi.rpc.password,
      },
    },
  })
}
