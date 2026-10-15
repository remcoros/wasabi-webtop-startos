import { VersionGraph } from '@start9labs/start-sdk'
import { current, WASABI_VERSION } from './current'
import { v_2_8_2_3 } from './v2.8.2_3'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_2_8_2_3],
})

export { WASABI_VERSION }
