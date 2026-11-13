import { store } from './fileModels/store.yaml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { jsonRpcPort, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'main')
  const uiOrigin = await multi.bindPort(uiPort, {
    protocol: 'http',
    addSsl: {},
    proxy: { addXForwardedHeaders: true },
  })

  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n('The Wasabi desktop, in your browser'),
    type: 'ui',
    schemeOverride: null,
    masked: false,
    username: null,
    path: '',
    query: {},
  })

  const uiReceipt = await uiOrigin.export([ui])
  const receipts = [uiReceipt]

  const jsonRpcServerEnabled = await store
    .read((f) => f.wasabi.rpc.enable)
    .const(effects)
  if (jsonRpcServerEnabled) {
    const rpcOrigin = await multi.bindPort(jsonRpcPort, {
      protocol: 'http',
      addSsl: {},
      proxy: { addXForwardedHeaders: true },
    })
    const rpc = sdk.createInterface(effects, {
      name: i18n('JSON-RPC'),
      id: 'rpc',
      description: i18n("Wasabi's JSON-RPC API for wallet automation"),
      type: 'api',
      schemeOverride: null,
      masked: false,
      username: null,
      path: '',
      query: {},
    })

    const rpcReceipt = await rpcOrigin.export([rpc])
    receipts.push(rpcReceipt)
  }

  return receipts
})
