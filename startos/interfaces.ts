import { store } from './file-models/store.yaml'
import { sdk } from './sdk'
import { uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, 'ui')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
  })

  const ui = sdk.createInterface(effects, {
    name: 'Web UI',
    id: 'ui',
    description: 'Web Interface',
    type: 'ui',
    schemeOverride: null,
    masked: false,
    username: null,
    path: '',
    search: {},
  })

  const uiReceipt = await uiMultiOrigin.export([ui])
  const receipts = [uiReceipt]

  const jsonRpcServerEnabled = await store
    .read((f) => f.wasabi.rpc.enable)
    .const(effects)
  if (jsonRpcServerEnabled) {
    const rpcMulti = sdk.MultiHost.of(effects, 'rpc')
    const rpcMultiOrigin = await rpcMulti.bindPort(37128, {
      protocol: 'http',
    })
    const rpc = sdk.createInterface(effects, {
      name: 'JSON-RPC',
      id: 'rpc',
      description: 'JSON-RPC Interface',
      type: 'api',
      schemeOverride: null,
      masked: false,
      username: null,
      path: '',
      search: {},
    })
    const rpcReceipt = await rpcMultiOrigin.export([rpc])
    receipts.push(rpcReceipt)
  }

  return receipts
})
