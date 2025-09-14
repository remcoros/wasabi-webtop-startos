import { matches, FileHelper, T } from '@start9labs/start-sdk'
const { object, string, boolean, oneOf, literal, number, array } = matches

/*
 * Config.json
 */

// not all possible fields of Wasabi config are included, so
// so do not write a new file, use 'merge' instead
const ConfigShape = object({
  EnableGpu: boolean,
  ConfigVersion: number,
  UseBitcoinRpc: boolean,
  BitcoinRpcEndPoint: string,
  BitcoinRpcCredentialString: string,
  UseTor: oneOf(literal('Enabled'), literal('Disabled')),
  JsonRpcServerEnabled: boolean,
  JsonRpcUser: string,
  JsonRpcPassword: string,
  JsonRpcServerPrefixes: array(string),
})

export type ConfigFileType = typeof ConfigShape._TYPE

export const configFile = FileHelper.json(
  {
    volumeId: 'main',
    subpath: '.walletwasabi/client/Config.json',
  },
  ConfigShape,
)
