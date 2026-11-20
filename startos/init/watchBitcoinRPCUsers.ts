import { utils } from '@start9labs/start-sdk'
import { generateRpcUserDependent } from 'bitcoin-core-startos/startos/actions/generateRpcUserDependent'
import { rpcHostId, rpcPort } from 'bitcoin-core-startos/startos/utils'
import { store } from '../fileModels/store.yaml'
import { sdk } from '../sdk'
import {
  generateRpcPassword,
  generateRpcUsername,
  rpcPasswordLength,
} from '../utils'
import { i18n } from '../i18n'

const replayId = 'request-rpc-credentials'

export const watchBitcoinRPCUsers = sdk.setupOnInit(async (effects) => {
  const settings = await store.read().const(effects)

  if (
    !settings?.wasabi.managesettings ||
    settings.wasabi.server.type !== 'bitcoind'
  ) {
    await sdk.action.clearTask(effects, replayId)
    return
  }

  const requestRegistration = (username: string, password: string) =>
    sdk.action.createTask(
      effects,
      'bitcoind',
      generateRpcUserDependent,
      'critical',
      {
        replayId,
        reason: i18n('Create RPC credentials for Wasabi'),
        input: {
          kind: 'partial',
          accept: [{ username, password }],
          set: { username, password },
        },
      },
    )

  const { user, password } = settings.wasabi.server

  // Writing here re-runs this hook; the branches below then see a credential.
  if (!user || !password) {
    const fresh = {
      user: generateRpcUsername(),
      password: generateRpcPassword(),
    }
    await requestRegistration(fresh.user, fresh.password)
    await store.merge(
      effects,
      { wasabi: { server: fresh } },
      { allowWriteAfterConst: true },
    )
    return
  }

  // Pruned Bitcoin exposes bridge RPC through `proxy`, not `bitcoind`.
  const rpcReadySince = await utils.Watchable.combine(
    effects,
    [sdk.getStatus(effects, { packageId: 'bitcoind' })],
    ([status]) =>
      status?.health['bitcoind']?.result === 'success' &&
      (!status.health['proxy'] || status.health['proxy'].result === 'success')
        ? status.started
        : null,
  ).const()
  const rpcAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: rpcHostId,
      internalPort: rpcPort,
      ssl: false,
    })
    .const()
  if (!rpcReadySince || !rpcAddress) return

  const status = await fetch(`http://${rpcAddress}/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jsonrpc: '1.0', id: 'wasabi', method: 'uptime' }),
    signal: AbortSignal.timeout(10_000),
  }).then(
    (res) => res.status,
    () => null,
  )

  if (status === 200) {
    await sdk.action.clearTask(effects, replayId)
    return
  }
  // Unreachable, or an answer that says nothing about the credential.
  if (status !== 401) return

  // Bitcoin will not accept a password below its floor and the user cannot edit
  // the one we supply, so rotate before asking rather than raising a task they
  // could never complete.
  if (password.length < rpcPasswordLength) {
    const rotated = generateRpcPassword()
    await requestRegistration(user, rotated)
    await store.merge(
      effects,
      { wasabi: { server: { password: rotated } } },
      { allowWriteAfterConst: true },
    )
    return
  }

  await requestRegistration(user, password)
})
