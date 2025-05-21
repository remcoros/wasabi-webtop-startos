import { sdk } from '../sdk'
import { store } from '../file-models/store.yaml'
import { generateRpcPassword } from '../utils'
import { generateRpcUserDependent } from 'bitcoind-startos/startos/actions/generateRpcUserDependent'

export const resetRpcAuth = sdk.Action.withoutInput(
  // id
  'reset-rpc-auth',

  // metadata
  async ({ effects }) => {
    const conf = await store.read().const(effects)
    const serverType = conf?.wasabi.server.type

    return {
      name: 'Create RPC Credentials',
      description:
        'Create new Bitcoin RPC credentials for Wasabi Wallet. NOTE: this will restart the service!',
      warning: null,
      allowedStatuses: 'any',
      group: 'Maintenance',
      visibility: serverType == 'bitcoind' ? 'enabled' : 'hidden',
    }
  },

  // execution function
  async ({ effects }) => {
    const username = 'wasabi_' + generateRpcPassword(6)
    const password = generateRpcPassword()

    await store.merge(effects, {
      wasabi: {
        server: {
          user: username,
          password: password,
        },
      },
    })

    // request to create rpc credentials in bitcoind
    await sdk.action.createTask(
      effects,
      'bitcoind',
      generateRpcUserDependent,
      'critical',
      {
        replayId: 'request-rpc-credentials',
        reason: 'Create RPC credentials for Wasabi Wallet',
        input: {
          kind: 'partial',
          value: {
            username: username,
            password: password,
          },
        },
      },
    )

    return {
      version: '1',
      title: 'Success',
      message:
        'RPC credentials have been reset. Follow the instructions in the UI to create new credentials in the Bitcoin service.',
      result: null,
    }
  },
)
